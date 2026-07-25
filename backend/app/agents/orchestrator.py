import traceback

from app.agents.account_agent import run as account_agent
from app.agents.icp_agent import run as icp_agent
from app.agents.research_agent import run as research_agent
from app.agents.contact_agent import run as contact_agent
from app.agents.email_agent import run as email_agent


def run_campaign(vertical, reference_company):
    print("Running ICP...")
    profile = icp_agent(vertical, reference_company)

    print("Finding companies...")
    companies = account_agent(profile.data, reference_company)

    if not companies.success:
        raise RuntimeError(f"Account discovery failed: {companies.errors}")

    matched_companies = companies.data.get("companies", [])

    if not matched_companies:
        raise RuntimeError(
            "Account discovery returned no companies. Try a broader "
            "vertical/reference company, or check the Tavily search "
            "results for this query."
        )

    output = []

    for company in matched_companies:
        company_name = company.get("name", "Unknown company")
        print(f"Researching {company_name}...")

        # Each company goes through 3 more LLM/search stages. If any one
        # of them fails (bad JSON from the model, a rate limit that
        # exhausts all retries, a network blip), we don't want that to
        # take down the whole campaign and lose the accounts/contacts
        # we already found for the *other* companies. We record the
        # failure on this company's entry and keep going instead.
        try:
            research = research_agent(company, profile.data.get("industry", ""))
            contacts = contact_agent(company)
            emails = email_agent(
                company,
                research.data,
                contacts.data.get("contacts", []),
            )

            output.append(
                {
                    "company": company,
                    "research": research.data,
                    "contacts": contacts.data.get("contacts", []),
                    "emails": emails.data.get("emails", []),
                    "sources": research.sources,
                }
            )
        except Exception as exc:
            print(f"Failed while processing {company_name}: {exc}")
            traceback.print_exc()

            output.append(
                {
                    "company": company,
                    "research": None,
                    "contacts": [],
                    "emails": [],
                    "sources": [],
                    "error": str(exc),
                }
            )

    print("Done!")

    return output
