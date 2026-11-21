"""MODIS + VIIRS Harmonized Burn Calendar — FastAPI entry point."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse

from app.config import get_settings
from app.db import close_pool, init_pool
from app.routers import fire

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup / shutdown."""
    logger.info("Starting Burn Calendar API …")
    init_pool()
    yield
    close_pool()
    logger.info("Burn Calendar API shut down.")


app = FastAPI(
    title="MODIS + VIIRS Harmonized Burn Calendar",
    version="1.0.0",
    description="25 years of harmonized fire-activity data from NASA FIRMS.",
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
    docs_url="/api/docs",
    redoc_url=None,
)

# ── Middleware ───────────────────────────────────────────────────────
cfg = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1_000)

# ── Routers ──────────────────────────────────────────────────────────
app.include_router(fire.router, prefix="/api/v1")
