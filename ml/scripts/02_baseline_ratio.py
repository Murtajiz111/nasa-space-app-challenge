"""02_baseline_ratio.py
Compute empirical monthly ratio baseline:
ratio(country, mon) = median(VIIRS_SNPP / MODIS)
Uncertainty bounds: p25 and p75 ratios.
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def compute_baseline_ratios(paired_df: pd.DataFrame, out_json: Path) -> dict:
    """Compute empirical median, p25, and p75 ratios per (country, mon)."""
    paired_df["ratio"] = paired_df["viirs_count"] / paired_df["modis_count"].replace(0, np.nan)
    valid = paired_df.dropna(subset=["ratio"]).copy()

    results = {}
    grouped = valid.groupby(["country", "mon"])["ratio"]

    for (country, mon), group in grouped:
        if country not in results:
            results[country] = {}
        results[country][int(mon)] = {
            "median": float(group.median()),
            "p25": float(group.quantile(0.25)),
            "p75": float(group.quantile(0.75)),
            "n_samples": int(len(group)),
        }

    out_json.parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, "w") as f:
        json.dump(results, f, indent=2)

    logger.info("Saved calibration ratio matrix to %s", out_json)
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compute baseline empirical ratios")
    parser.add_argument("--input", type=Path, default=Path("ml/artifacts/paired_observations.parquet"))
    parser.add_argument("--output", type=Path, default=Path("ml/artifacts/baseline_ratios.json"))
    args = parser.parse_args()
    if args.input.exists():
        df = pd.read_parquet(args.input)
        compute_baseline_ratios(df, args.output)
    else:
        logger.info("Script initialized; ready for evaluation against baseline.")
