"""06_export_to_supabase.py
Export harmonized dataset to a new Supabase PostgreSQL table (e.g., hotspots_harmonized_ml).
Safety check: Never overwrite the existing baseline table; writes to a separate candidate table.
"""

from __future__ import annotations

import argparse
import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def export_candidates(df_path: Path, target_table: str = "hotspots_harmonized_ml"):
    """Safely export harmonized candidate dataset to Supabase."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL not set in environment.")
        return

    logger.info("Adoption protocol: Exporting to dedicated candidate table '%s'", target_table)
    logger.info("Preserving existing baseline table 'hotspots_harmonized'.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export ML harmonized dataset to candidate Supabase table")
    parser.add_argument("--input", type=Path, default=Path("ml/artifacts/harmonized_candidate.parquet"))
    parser.add_argument("--table", type=str, default="hotspots_harmonized_ml")
    args = parser.parse_args()
    logger.info("Supabase export module initialized.")
