
import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
from openai import OpenAI
from openai import APIStatusError as GroqAPIStatusError

GEMINI_MODEL = "gemini-3.6-flash"
MAX_RETRIES = 5
MIN_INTERVAL = 1.0  # seconds between calls -> comfortably under Gemini free tier's 10-15 RPM

# Groq's API is OpenAI-compatible, so the already-installed `openai` package
# talks to it with just a base_url + api_key swap. llama-3.3-70b-versatile
# was deprecated in June 2026 — openai/gpt-oss-120b is Groq's current
# recommended general-purpose replacement. Override with GROQ_MODEL if you
# want a different one (see https://console.groq.com/docs/models).
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

_groq_client = None


def _get_groq_client():
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return None
        _groq_client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    return _groq_client


_last_call = 0.0

# Once we see a *daily* Gemini quota error, there's no point spending
# ~60s retrying Gemini on every subsequent call for the rest of the
# process's life — the quota won't reset for hours. Skip straight to
# Groq (if configured) for the remainder of this run.
_gemini_daily_quota_exhausted = False


def _throttle():
    """Space out calls so we never burst past Gemini's per-minute limits."""
    global _last_call
    elapsed = time.time() - _last_call
    if elapsed < MIN_INTERVAL:
        time.sleep(MIN_INTERVAL - elapsed)
    _last_call = time.time()


def _wait_time(err, attempt):
    """Prefer the API's actual retry-after header over a guessed backoff."""
    try:
        retry_after = err.response.headers.get("retry-after")
        if retry_after:
            return float(retry_after) + 0.5
    except Exception:
        pass
    return min(2 ** (attempt + 2), 30)  # 4, 8, 16, 30, 30...


def _is_daily_quota_error(err: errors.ClientError) -> bool:
    """
    Distinguish "you'll be fine in a few seconds" (per-minute) rate limits
    from "you're done until tomorrow" (per-day) quota errors. Retrying the
    latter with exponential backoff just burns time before failing anyway.
    """
    try:
        violations = err.details["error"]["details"]
        for detail in violations:
            for violation in detail.get("violations", []):
                if "PerDay" in violation.get("quotaId", ""):
                    return True
    except Exception:
        pass
    # Fall back to string matching in case the error shape changes.
    return "PerDay" in str(err)


def _generate_gemini(prompt: str):
    global _gemini_daily_quota_exhausted

    for attempt in range(MAX_RETRIES):
        _throttle()
        try:
            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    # JSON mode: Gemini enforces valid, schema-shaped JSON at
                    # generation time, so we no longer need to strip markdown
                    # fences, hunt for the first "{", or work around trailing
                    # prose / unescaped newlines the way Groq's model needed.
                    response_mime_type="application/json",
                ),
            )

            text = response.text.strip()

            print("\n========== GEMINI RESPONSE ==========")
            print(text)
            print("======================================\n")

            return json.loads(text)

        except errors.ClientError as e:
            if e.code != 429:
                raise  # not a rate limit — a real error, retrying won't help

            if _is_daily_quota_error(e):
                print("Gemini daily quota exhausted — falling back to Groq for the rest of this run.")
                _gemini_daily_quota_exhausted = True
                raise

            if attempt == MAX_RETRIES - 1:
                raise

            wait = _wait_time(e, attempt)
            print(f"Gemini rate limited (attempt {attempt + 1}/{MAX_RETRIES}). Retrying in {wait:.1f}s...")
            time.sleep(wait)

        except json.JSONDecodeError:
            raise ValueError("Gemini did not return valid JSON.")

    raise RuntimeError("Failed to generate a Gemini response after retries.")


def _generate_groq(prompt: str):
    client = _get_groq_client()
    if client is None:
        raise RuntimeError(
            "Gemini is unavailable and GROQ_API_KEY is not set, so there's "
            "no fallback. Add GROQ_API_KEY to backend/.env to enable it."
        )

    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                response_format={"type": "json_object"},
            )

            text = response.choices[0].message.content.strip()

            print("\n========== GROQ RESPONSE ==========")
            print(text)
            print("====================================\n")

            return json.loads(text)

        except GroqAPIStatusError as e:
            if e.status_code != 429 or attempt == MAX_RETRIES - 1:
                raise

            wait = min(2 ** (attempt + 2), 30)
            print(f"Groq rate limited (attempt {attempt + 1}/{MAX_RETRIES}). Retrying in {wait:.1f}s...")
            time.sleep(wait)

        except json.JSONDecodeError:
            raise ValueError("Groq did not return valid JSON.")

    raise RuntimeError("Failed to generate a Groq response after retries.")


def generate(prompt: str):
    """
    Generate JSON from an LLM, preferring Gemini and transparently falling
    back to Groq when Gemini's daily quota is exhausted (or was already
    exhausted earlier in this run).
    """
    if not _gemini_daily_quota_exhausted:
        try:
            return _generate_gemini(prompt)
        except errors.ClientError as e:
            if not (e.code == 429 and _is_daily_quota_error(e)):
                raise
            # fall through to Groq below

    return _generate_groq(prompt)
