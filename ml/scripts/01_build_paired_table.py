"""01_build_paired_table.py
Build paired MODIS and VIIRS concurrent monthly grid observation table (2012–2025).
Pairs monthly 0.25-degree grid cells by (country, year, mon, lat_c, lon_c).
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def build_paired_table(parquet_path: Path, output_path: Path) -> pd.DataFrame:
    """Load gridded monthly parquet and produce paired MODIS vs VIIRS table."""
    logger.info("Loading gridded monthly parquet: %s", parquet_path)
    df = pd.read_parquet(parquet_path)

    # Filter to concurrent observation era (2012–2025)
    df["year"] = df["month"].str.slice(0, 4).astype(int)
    df["mon"] = df["month"].str.slice(5, 7).astype(int)
    df = df[df["year"] >= 2012].copy()

    # Split MODIS and VIIRS SNPP (exclude NOAA-20 from training pairs)
    modis = df[df["sensor"] == "MODIS"].rename(
        columns={"n": "modis_count", "frp_sum": "modis_frp"}
    )
    viirs = df[df["sensor"] == "VIIRS_SNPP"].rename(
        columns={"n": "viirs_count", "frp_sum": "viirs_frp"}
    )

    # Merge on spatial-temporal grid key
    join_keys = ["country", "month", "year", "mon", "lat_c", "lon_c"]
    paired = pd.merge(
        modis[join_keys + ["modis_count", "modis_frp"]],
        viirs[join_keys + ["viirs_count", "viirs_frp"]],
        on=join_keys,
        how="inner",
    )

    logger.info("Created %d paired grid observations across AU, CA, US", len(paired))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    paired.to_parquet(output_path, index=False)
    logger.info("Saved paired dataset to %s", output_path)
    return paired


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build paired MODIS-VIIRS observation table")
    parser.add_argument("--input", type=Path, default=Path("hotspots_monthly_grid.parquet"))
    parser.add_argument("--output", type=Path, default=Path("ml/artifacts/paired_observations.parquet"))
    args = parser.parse_args()
    if args.input.exists():
        build_paired_table(args.input, args.output)
    else:
        logger.warning("Input file %s not found; ready for pipeline run when dataset is mounted.", args.input)
