from typing import Any

from pydantic import BaseModel, Field


class AgentResponse(BaseModel):
    success: bool
    data: Any = None
    sources: list[Any] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
