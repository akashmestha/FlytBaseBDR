import os
from pathlib import Path

from dotenv import load_dotenv
from tavily import TavilyClient

# Load backend/.env regardless of the process's current working directory
# (mirrors services/llm.py so `search` works the same whether uvicorn is
# started from backend/ or from the repo root).
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

TAVILY_MAX_QUERY_CHARS = 400

_client: TavilyClient | None = None


def _get_client() -> TavilyClient:
    global _client
    if _client is None:
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise RuntimeError(
                "TAVILY_API_KEY is not set. Add it to backend/.env "
                "(and to your deployment platform's environment variables)."
            )
        _client = TavilyClient(api_key=api_key)
    return _client


def search(query: str, max_results: int = 5, include_answer: bool = False) -> dict:
    """
    Thin wrapper around Tavily search used by every agent.

    Always returns a dict shaped like {"results": [...], "answer": "..."}
    so callers can safely do results["results"] / results.get("answer")
    without extra None-checks, even when Tavily itself fails.
    """
    # Tavily caps queries at 400 chars and raises a 400 if you go over, so
    # truncate defensively instead of letting a long ICP/company name blow
    # up the whole request.
    query = query.strip()[:TAVILY_MAX_QUERY_CHARS]

    client = _get_client()

    try:
        response = client.search(
            query=query,
            max_results=max_results,
            include_answer=include_answer,
        )
    except Exception as exc:
        # A single flaky search call shouldn't take down the whole
        # campaign — every caller already handles an empty results list.
        print(f"Tavily search failed for query={query!r}: {exc}")
        return {"results": [], "answer": ""}

    # Defensive: make sure downstream code always sees a list, even if
    # Tavily's response shape ever changes.
    response.setdefault("results", [])
    return response
