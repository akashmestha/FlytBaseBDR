from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.orchestrator import run_campaign

router = APIRouter(prefix="/campaign", tags=["Campaign"])


class CampaignRequest(BaseModel):
    vertical: str
    reference_company: str


@router.post("/run")
def campaign(request: CampaignRequest):
    return run_campaign(
        request.vertical,
        request.reference_company,
    )
