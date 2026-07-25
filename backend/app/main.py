import os
import traceback

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.campaign import router as campaign_router

load_dotenv()

app = FastAPI(title="FlytBase BDR Agent")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

# allow_credentials=True + allow_origins=["*"] is a combination browsers
# reject for credentialed requests. The frontend never sends cookies/auth
# headers (see frontend/src/services/api.js — plain axios.create with no
# withCredentials), so credentials aren't needed and we keep this False to
# avoid silent CORS failures whichever ALLOWED_ORIGINS ends up being set to.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Without this, an unexpected error anywhere in the pipeline (a bad
    # API key, a network blip, an LLM returning malformed JSON that slips
    # past the agents' own guards) surfaces to the deployed frontend as an
    # opaque "Network Error" / CORS-looking failure, because FastAPI's
    # default error response doesn't carry CORS headers. Catching it here
    # keeps the response inside the CORS middleware and gives the frontend
    # (and you, while debugging the live deployment) an actual message.
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {exc}"},
    )


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "flytbase-bdr-agent",
    }


app.include_router(campaign_router)
