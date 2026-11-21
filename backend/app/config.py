"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Immutable settings object – never exposes secrets in repr/str."""

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "",
    )
    ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    ]
    TABLE: str = os.getenv("HARMONIZATION_TABLE", "hotspots_harmonized")
    CACHE_TTL: int = int(os.getenv("CACHE_TTL_SECONDS", "600"))

    # Connection pool sizing – keep small for Supabase free-tier
    DB_MIN_SIZE: int = int(os.getenv("DB_MIN_SIZE", "1"))
    DB_MAX_SIZE: int = int(os.getenv("DB_MAX_SIZE", "5"))

    def __repr__(self) -> str:
        return "Settings(***)"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
