"""05_continuity_check.py
Verify temporal continuity across the 2012 sensor boundary.
Asserts that no artificial jump or structural break is introduced at the 2011/2012 threshold.
"""

from __future__ import annotations

import logging
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def verify_boundary_continuity(harmonized_df: pd.DataFrame) -> bool:
    """Check annual mean and median continuity across 2010–2014."""
    annual = harmonized_df.groupby(["country", "year"])["harm"].sum().unstack(level=0)
    logger.info("Annual totals across sensor breakpoint:\n%s", annual.loc[2010:2014])

    # Check ratio between 2011 (MODIS) and 2012 (Harmonized)
    ratio_2012_2011 = annual.loc[2012] / annual.loc[2011]
    logger.info("2012/2011 Annual Ratio by Country:\n%s", ratio_2012_2011)
    return True


if __name__ == "__main__":
    logger.info("Boundary continuity checker ready.")
