from app.models.agent_response import AgentResponse
from app.services.llm import generate


def run(vertical: str, reference_company: str) -> AgentResponse:
    prompt = f"""
You are a B2B sales strategist.

Target Vertical:
{vertical}

Reference Company:
{reference_company}

Identify the Ideal Customer Profile.

Return ONLY valid JSON.

Schema:

{{
    "industry": "",
    "company_size": "",
    "regions": [],
    "keywords": [],
    "must_have_characteristics": []
}}
"""

    response = generate(prompt)

    return AgentResponse(
        success=True,
        data=response,
    )
