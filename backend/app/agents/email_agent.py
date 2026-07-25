from app.models.agent_response import AgentResponse
from app.services.llm import generate


def run(company, research, contacts):
    # If contact_agent found zero real contacts for this company, we must
    # NOT ask the model to "personalize by role" anyway — with no contact
    # in the prompt it has nothing to ground itself on and will happily
    # invent a plausible-sounding name/title. Fabricated personas are an
    # automatic disqualifier for this assignment, so we skip email
    # generation entirely rather than risk it.
    if not contacts:
        return AgentResponse(
            success=True,
            data={"emails": []},
            errors=["No verified contacts found — skipped email generation to avoid fabricating a persona."],
        )

    contacts_text = "\n".join(
        f"- Name: {contact.get('name', '')}\n  Role: {contact.get('title', '')}"
        for contact in contacts
    )

    research = research or {}

    prompt = f"""
You are an expert B2B SDR.

Company:
{company.get("name", "")}

Country:
{company.get("country", "")}

Contacts:
{contacts_text}

Research:

Summary:
{research.get("summary", "")}

Recent Initiatives:
{research.get("recent_initiatives", [])}

Digital Transformation:
{research.get("digital_transformation", [])}

ESG:
{research.get("esg", [])}

You represent FlytBase.

FlytBase provides autonomous drone inspection solutions for industrial operations, including mining.

Generate ONE personalized cold email for EACH contact listed above. Do not
invent contacts that are not in the list.

Requirements:

- Mention something specific from the company research.
- Explain how FlytBase could help.
- Personalize according to the contact's role.
- Keep each email under 150 words.
- Professional tone.
- Do NOT generate duplicate emails.

Return ONLY valid JSON.

Schema:

{{
    "emails": [
        {{
            "contact": "",
            "subject": "",
            "body": ""
        }}
    ]
}}
"""

    emails = generate(prompt)
    emails["emails"] = emails.get("emails", [])

    return AgentResponse(
        success=True,
        data=emails,
    )
