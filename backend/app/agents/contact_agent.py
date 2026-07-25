from app.models.agent_response import AgentResponse
from app.services.search import search
from app.services.llm import generate


def run(company):
    # Biasing toward linkedin.com/in pages (rather than just mentioning the
    # word "LinkedIn") actually returns profile URLs in results[].url, which
    # we then hand to the model — instead of hoping it infers a link from
    # press-release text that never contained one.
    query = f'site:linkedin.com/in "{company["name"]}" (Head of Operations OR VP OR Director OR Leadership)'

    results = search(query, max_results=5)

    search_results = "\n\n".join(
        f"Title: {r['title']}\n"
        f"URL: {r['url']}\n"
        f"Content: {r['content'][:700]}"
        for r in results["results"]
    )

    prompt = f"""
You are given search results about a company.

Company:
{company["name"]}

Search Results:

{search_results}

Extract ONLY real contacts.

For "linkedin", use the exact URL from the matching search result's URL
field above. Only fill it in if that result is actually that person's
LinkedIn profile page. Leave it as an empty string if you're not sure —
never invent or guess a URL.

Return ONLY valid JSON.

Schema:

{{
  "contacts":[
    {{
      "name":"",
      "title":"",
      "linkedin":"",
      "source":""
    }}
  ]
}}

If no contacts are found return:

{{"contacts":[]}}
"""

    contacts = generate(prompt)
    contacts["contacts"] = contacts.get("contacts", [])

    return AgentResponse(
        success=True,
        data=contacts,
        sources=results["results"],
    )