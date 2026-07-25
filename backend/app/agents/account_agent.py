from app.models.agent_response import AgentResponse
from app.services.search import search
from app.services.llm import generate
from typing import Dict, Any

def run(icp: Dict[str, Any], reference_company: str) -> AgentResponse:
    # Tavily caps queries at 400 chars. Gemini's ICP output tends to be much
    # more detailed than Groq's was (full characteristic sentences, multiple
    # regions), so we keep the search query to just what actually helps
    # retrieval — industry + reference company + top region — rather than
    # dumping the whole ICP object into it.
    primary_region = icp["regions"][0] if icp.get("regions") else ""
    industry = icp.get("industry", "")

    query = f"Companies similar to {reference_company} in {industry}"
    if primary_region:
        query += f", operating in {primary_region}"

    results = search(query)

    if not results.get("results"):
        return AgentResponse(
            success=False,
            errors=["No companies found"],
        )

    search_results = "\n\n".join(
        f"Title: {r['title']}\n"
        f"Content: {r['content']}"
        for r in results["results"]
    )

    prompt = f"""
    You are given search results about companies in the {industry} industry.

    Search Results:

    {search_results}

    Extract companies similar to {reference_company}.

    Return ONLY valid JSON.

    Schema:

    {{
      "companies": [
        {{
          "name": "",
          "country": "",
          "why_match": ""
        }}
      ]
    }}

    Do not return markdown.
    Do not explain.
    Return only the JSON object.
    """

    companies = generate(prompt)

    # Defensive: the model is instructed to always return a "companies"
    # list, but LLM output is never 100% guaranteed to match the schema,
    # so fall back to an empty list instead of raising a KeyError that
    # would 500 the whole campaign.
    companies["companies"] = companies.get("companies", [])[:5]

    return AgentResponse(
        success=True,
        data=companies,
        sources=results["results"],
    )
