# FlytBase BDR Agent — Submission

## What I built

An AI-powered outbound sales intelligence tool for FlytBase's BDR (Business
Development Rep) team. You give it a target vertical and one reference
company (e.g. _"mining" / "Rio Tinto"_), and it runs a five-stage agent
pipeline that:

1. Defines the Ideal Customer Profile (ICP) for that vertical
2. Finds real companies that match it
3. Researches each company's recent initiatives, digital transformation
   efforts, and ESG activity
4. Finds real decision-makers at each company (with verified LinkedIn URLs)
5. Drafts a personalized cold email per contact, grounded in that research

The output is a ready-to-review target list with sourced research and
draft outreach — the multi-hour manual version of a BDR's "build me a
prospect list" task, compressed into one request.

## Why a multi-agent pipeline instead of one big prompt

Each stage needs a different kind of grounding:

- ICP definition is pure reasoning — no search needed.
- Account discovery and research both need **current, real web results**
  (an LLM alone will happily invent plausible-sounding companies).
- Contact and email generation need **hard guardrails against
  fabrication** — inventing a name, title, or LinkedIn URL is worse than
  returning nothing, because it looks credible until someone acts on it.

Splitting these into separate agents means each one gets exactly the
context and constraints it needs, and a failure in one stage (bad JSON
back from the model, a search that returns nothing) doesn't have to
corrupt the others.

## Architecture

```
React/Vite frontend
        │  POST /campaign/run { vertical, reference_company }
        ▼
FastAPI backend
        │
        ▼
   Orchestrator ── loops per discovered company, isolates failures
        │
        ├─ 1. ICP Agent          (Gemini)
        ├─ 2. Account Agent      (Tavily search → Gemini)
        ├─ 3. Research Agent     (Tavily search → Gemini)   ─┐
        ├─ 4. Contact Agent      (Tavily search → Gemini)    ├─ per company
        └─ 5. Email Agent        (Gemini)                   ─┘
```

## The pipeline, stage by stage

**1. ICP Agent** — Takes the vertical + reference company and asks Gemini
to return a structured ICP (industry, company size, regions, keywords,
must-have characteristics) as strict JSON. No search — this is a
reasoning step.

**2. Account Discovery Agent** — Builds a short, targeted Tavily query
from the ICP (industry + reference company + top region — not the whole
ICP object, since Tavily caps queries at 400 characters), then asks
Gemini to extract up to 5 real matching companies from the search
results, with a one-line "why this matches" for each.

**3. Research Agent** — For each discovered company, runs a targeted
search (recent initiatives, digital transformation, drone inspection,
safety, ESG, 2025/2026) and has Gemini summarize it into a structured
brief: summary, recent initiatives, digital transformation signals, ESG
activity, operational challenges, and interesting facts — each field a
list of short, plain-string facts so downstream stages can consume it
predictably.

**4. Contact Agent** — Runs a `site:linkedin.com/in` biased search for
decision-makers ("Head of Operations", "VP", "Director") at the company.
Critically, the LinkedIn URL is only ever filled in if it matches an
actual URL from the search results — the model is explicitly instructed
to leave it blank rather than guess, so we never hand a BDR a fabricated
profile link.

**5. Email Agent** — Drafts one personalized email per verified contact,
grounded in the research brief and the contact's specific role, under
150 words, professional tone. **If contact discovery found zero verified
contacts, this stage is skipped entirely** rather than asked to
"personalize" against an invented persona — a deliberate design choice
to keep fabricated outreach out of the product.

## Reliability decisions worth calling out

- **LLM fallback:** Gemini is primary, with automatic fallback to Groq
  (OpenAI-compatible API) if Gemini's _daily_ quota is exhausted. The
  code distinguishes per-minute rate limits (worth retrying with
  backoff) from per-day quota exhaustion (not worth retrying — fail
  fast to Groq instead).
- **Per-company error isolation:** the orchestrator wraps each company's
  research/contacts/email stages in a try/except. One company's failure
  (bad JSON, exhausted retries, network blip) doesn't take down the
  whole campaign — it's recorded on that company's entry and the run
  continues.
- **Defensive search wrapper:** a single flaky Tavily call returns an
  empty result set instead of raising, so callers never need extra
  None-checks.
- **Schema-shaped generation:** Gemini's JSON mode is used throughout
  instead of asking the model to "return JSON" in prose and hoping —
  this removes an entire class of fence-stripping/parsing bugs.

## Tech stack

| Layer            | Choice                                                                |
| ---------------- | --------------------------------------------------------------------- |
| Backend          | FastAPI (Python 3.14), `uv` for dependency management                 |
| LLM              | Gemini (`gemini-3.6-flash`), Groq (`openai/gpt-oss-120b`) as fallback |
| Search           | Tavily                                                                |
| Frontend         | React 19 + Vite 8 + Tailwind 4                                        |
| Backend hosting  | Render                                                                |
| Frontend hosting | Vercel                                                                |

## Deployment

- **Live app:** `https://flyt-base-bdr.vercel.app/`
- **Backend health check:** https://flytbasebdr.onrender.com/health
- **Repo:** https://github.com/akashmestha/FlytBaseBDR

## Known limitations / what I'd do next with more time

- `/campaign/run` is synchronous and can take well over a minute for
  multiple companies — in a real production version I'd make it return
  a job ID immediately and poll for results, both for UX and to avoid
  hosting-provider request timeouts.
- No auth/rate limiting on the endpoint — fine for a hackathon demo,
  not for a public link left running indefinitely.
- No persistence — every run is stateless; a real version would store
  campaigns so a BDR could revisit past prospect lists.
- Free-tier hosting means the backend cold-starts after inactivity
  (~50s+ delay on the first request after idle).
