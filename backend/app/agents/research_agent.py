from typing import Any, Dict

from app.models.agent_response import AgentResponse
from app.services.llm import generate
from app.services.search import search


def run(company: Dict[str, Any], industry: str = "") -> AgentResponse:
    query = f"""
{company['name']}

Recent {industry} initiatives
Digital transformation
Drone inspection
Automation
Safety
ESG
Operations
2025 OR 2026
"""

    results = search(query)

    MAX_RESULTS = 3
    MAX_CONTENT = 300

    search_results = "\n\n".join(
        f"Title: {r['title']}\nContent: {r['content'][:MAX_CONTENT]}"
        for r in results["results"][:MAX_RESULTS]
    )

    prompt = f"""
Below is research about a company{f" in the {industry} industry" if industry else ""}.

Company:
{company['name']}

Search Results:

{search_results}

Return ONLY valid JSON.

Schema (every list item must be a plain string, not an object):

{{
    "summary": "",
    "recent_initiatives": ["short string", "short string"],
    "digital_transformation": ["short string", "short string"],
    "esg": ["short string", "short string"],
    "operational_challenges": ["short string", "short string"],
    "interesting_facts": ["short string", "short string"]
}}

Each list item must be a single plain string sentence, never a nested object.
If a category has no relevant info, return an empty list [].
Do not explain.
Return only JSON.
"""

    research = generate(prompt)

    return AgentResponse(
        success=True,
        data=research,
        sources=[
            {
                "title": r["title"],
                "url": r["url"],
            }
            for r in results["results"]
        ],
    )
