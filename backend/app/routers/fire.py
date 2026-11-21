"""Fire data API endpoints — /api/v1/*."""

from __future__ import annotations

import csv
import io
import logging
from typing import Optional

from cachetools import TTLCache
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import ORJSONResponse

from app.config import get_settings
from app.db import query, query_one
from app.schemas import (
    AnomalyPoint,
    AnomalyResponse,
    CalendarCell,
    CalendarResponse,
    CellsResponse,
    ComparePoint,
    CompareResponse,
    GridCell,
    HealthResponse,
    MetaResponse,
    CountryMeta,
    SummaryKPI,
    SummaryResponse,
    TimeseriesPoint,
    TimeseriesResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()

cfg = get_settings()
TABLE = cfg.TABLE
_cache: TTLCache = TTLCache(maxsize=256, ttl=cfg.CACHE_TTL)

COUNTRIES = ["Australia", "Canada", "United States"]


def _validate_country(country: str) -> str:
    if country not in COUNTRIES:
        raise HTTPException(422, f"country must be one of {COUNTRIES}")
    return country


def _bounds_fragments(
    min_lat: float | None,
    max_lat: float | None,
    min_lon: float | None,
    max_lon: float | None,
    params: list,
) -> str:
    """Build optional bounding-box WHERE clause fragments (psycopg2 %s style)."""
    clauses = []
    if min_lat is not None:
        params.append(min_lat)
        clauses.append("lat_c >= %s")
    if max_lat is not None:
        params.append(max_lat)
        clauses.append("lat_c <= %s")
    if min_lon is not None:
        params.append(min_lon)
        clauses.append("lon_c >= %s")
    if max_lon is not None:
        params.append(max_lon)
        clauses.append("lon_c <= %s")
    return " AND ".join(clauses)


# ── /health ──────────────────────────────────────────────────────────
@router.get("/health", response_model=HealthResponse)
def health():
    """Check database connectivity and row count."""
    try:
        row = query_one(f"SELECT count(*) AS cnt FROM {TABLE}")
        count = row["cnt"] if row else 0
        return HealthResponse(status="ok", database="connected", row_count=count)
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        return ORJSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected", "row_count": 0},
        )


# ── /meta ────────────────────────────────────────────────────────────
@router.get("/meta", response_model=MetaResponse)
def meta():
    """Return metadata: country bounds, date coverage, sensors."""
    cache_key = "meta"
    if cache_key in _cache:
        return _cache[cache_key]

    rows = query(
        f"""
        SELECT country,
               count(*)::int           AS rows,
               min(lat_c)              AS lat_min,
               max(lat_c)              AS lat_max,
               min(lon_c)              AS lon_min,
               max(lon_c)              AS lon_max,
               min(year)::int          AS year_min,
               max(year)::int          AS year_max,
               array_agg(DISTINCT sensor) AS sensors
        FROM {TABLE}
        GROUP BY country
        ORDER BY country
        """
    )

    total = sum(r["rows"] for r in rows)
    countries = [
        CountryMeta(
            country=r["country"],
            rows=r["rows"],
            lat_min=float(r["lat_min"]),
            lat_max=float(r["lat_max"]),
            lon_min=float(r["lon_min"]),
            lon_max=float(r["lon_max"]),
            year_min=r["year_min"],
            year_max=r["year_max"],
            sensors=sorted(r["sensors"]),
        )
        for r in rows
    ]

    resp = MetaResponse(
        countries=countries,
        total_rows=total,
        partial_months_note=(
            "Months before July 2002 are partial because Aqua had not yet "
            "joined Terra. These are excluded from analytics by default."
        ),
    )
    _cache[cache_key] = resp
    return resp


# ── /calendar ────────────────────────────────────────────────────────
@router.get("/calendar", response_model=CalendarResponse)
def calendar(
    country: str = Query("Australia"),
    year_start: int = Query(2000, ge=2000, le=2025),
    year_end: int = Query(2025, ge=2000, le=2025),
    include_partial: bool = Query(False),
):
    """Year × month fire-activity matrix."""
    _validate_country(country)
    cache_key = f"cal:{country}:{year_start}:{year_end}:{include_partial}"
    if cache_key in _cache:
        return _cache[cache_key]

    partial_clause = "" if include_partial else "AND partial = false"

    rows = query(
        f"""
        SELECT year::int, mon::int,
               sum(harm)    AS harm,
               sum(harm_lo) AS harm_lo,
               sum(harm_hi) AS harm_hi,
               bool_or(partial) AS partial
        FROM {TABLE}
        WHERE country = %s AND year >= %s AND year <= %s
              {partial_clause}
        GROUP BY year, mon
        ORDER BY year, mon
        """,
        (country, year_start, year_end),
    )

    cells = [
        CalendarCell(
            year=r["year"],
            mon=r["mon"],
            harm=round(float(r["harm"]), 1),
            harm_lo=round(float(r["harm_lo"]), 1),
            harm_hi=round(float(r["harm_hi"]), 1),
            partial=r["partial"],
        )
        for r in rows
    ]
    resp = CalendarResponse(country=country, cells=cells)
    _cache[cache_key] = resp
    return resp


# ── /timeseries ──────────────────────────────────────────────────────
@router.get("/timeseries", response_model=TimeseriesResponse)
def timeseries(
    country: str = Query("Australia"),
    year_start: int = Query(2000, ge=2000, le=2025),
    year_end: int = Query(2025, ge=2000, le=2025),
    include_partial: bool = Query(False),
    min_lat: Optional[float] = Query(None, ge=-90, le=90),
    max_lat: Optional[float] = Query(None, ge=-90, le=90),
    min_lon: Optional[float] = Query(None, ge=-180, le=180),
    max_lon: Optional[float] = Query(None, ge=-180, le=180),
):
    """Monthly harmonized fire activity time series."""
    _validate_country(country)
    params: list = [country, year_start, year_end]
    partial_clause = "" if include_partial else "AND partial = false"

    bounds = _bounds_fragments(min_lat, max_lat, min_lon, max_lon, params)
    bounds_clause = f"AND {bounds}" if bounds else ""

    cache_key = f"ts:{country}:{year_start}:{year_end}:{include_partial}:{min_lat}:{max_lat}:{min_lon}:{max_lon}"
    if cache_key in _cache:
        return _cache[cache_key]

    rows = query(
        f"""
        SELECT month,
               sum(harm)    AS harm,
               sum(harm_lo) AS harm_lo,
               sum(harm_hi) AS harm_hi,
               bool_or(partial) AS partial
        FROM {TABLE}
        WHERE country = %s AND year >= %s AND year <= %s
              {partial_clause} {bounds_clause}
        GROUP BY month
        ORDER BY month
        """,
        params,
    )

    data = [
        TimeseriesPoint(
            month=r["month"],
            harm=round(float(r["harm"]), 1),
            harm_lo=round(float(r["harm_lo"]), 1),
            harm_hi=round(float(r["harm_hi"]), 1),
            partial=r["partial"],
        )
        for r in rows
    ]
    resp = TimeseriesResponse(country=country, data=data)
    _cache[cache_key] = resp
    return resp


# ── /anomaly ─────────────────────────────────────────────────────────
@router.get("/anomaly", response_model=AnomalyResponse)
def anomaly(
    country: str = Query("Australia"),
    year_start: int = Query(2000, ge=2000, le=2025),
    year_end: int = Query(2025, ge=2000, le=2025),
    include_partial: bool = Query(False),
):
    """Historical anomaly: each month vs. its historical median (leave-one-out)."""
    _validate_country(country)
    partial_clause = "" if include_partial else "AND partial = false"

    cache_key = f"anom:{country}:{year_start}:{year_end}:{include_partial}"
    if cache_key in _cache:
        return _cache[cache_key]

    rows = query(
        f"""
        WITH monthly AS (
            SELECT year::int, mon::int, month,
                   sum(harm) AS harm,
                   bool_or(partial) AS partial
            FROM {TABLE}
            WHERE country = %s AND year >= %s AND year <= %s
                  {partial_clause}
            GROUP BY year, mon, month
        ),
        medians AS (
            SELECT m.year, m.mon, m.month, m.harm, m.partial,
                   (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY o.harm)
                    FROM monthly o
                    WHERE o.mon = m.mon AND o.year != m.year
                   ) AS median_val
            FROM monthly m
        )
        SELECT year, mon, month, harm, median_val, partial
        FROM medians
        ORDER BY year, mon
        """,
        (country, year_start, year_end),
    )

    data = []
    for r in rows:
        harm_val = float(r["harm"])
        median_val = float(r["median_val"]) if r["median_val"] is not None else 0.0
        anomaly_val = harm_val - median_val
        anomaly_pct = (anomaly_val / median_val * 100) if median_val > 0 else 0.0
        data.append(
            AnomalyPoint(
                year=r["year"],
                mon=r["mon"],
                month=r["month"],
                harm=round(harm_val, 1),
                median=round(median_val, 1),
                anomaly=round(anomaly_val, 1),
                anomaly_pct=round(anomaly_pct, 1),
                partial=r["partial"],
            )
        )

    resp = AnomalyResponse(country=country, data=data)
    _cache[cache_key] = resp
    return resp


# ── /cells ───────────────────────────────────────────────────────────
@router.get("/cells", response_model=CellsResponse)
def cells(
    country: str = Query("Australia"),
    month: str = Query(..., description="YYYY-MM format"),
    min_lat: Optional[float] = Query(None, ge=-90, le=90),
    max_lat: Optional[float] = Query(None, ge=-90, le=90),
    min_lon: Optional[float] = Query(None, ge=-180, le=180),
    max_lon: Optional[float] = Query(None, ge=-180, le=180),
):
    """Grid-cell data for a specific month."""
    _validate_country(country)
    params: list = [country, month]
    bounds = _bounds_fragments(min_lat, max_lat, min_lon, max_lon, params)
    bounds_clause = f"AND {bounds}" if bounds else ""

    cache_key = f"cells:{country}:{month}:{min_lat}:{max_lat}:{min_lon}:{max_lon}"
    if cache_key in _cache:
        return _cache[cache_key]

    rows = query(
        f"""
        SELECT lat_c + 0.125 AS lat_c,
               lon_c + 0.125 AS lon_c,
               harm, harm_lo, harm_hi, frp_sum, sensor, partial
        FROM {TABLE}
        WHERE country = %s AND month = %s
              {bounds_clause}
        ORDER BY harm DESC
        """,
        params,
    )

    grid = [
        GridCell(
            lat_c=float(r["lat_c"]),
            lon_c=float(r["lon_c"]),
            harm=round(float(r["harm"]), 2),
            harm_lo=round(float(r["harm_lo"]), 2),
            harm_hi=round(float(r["harm_hi"]), 2),
            frp_sum=round(float(r["frp_sum"]), 1),
            sensor=r["sensor"],
            partial=r["partial"],
        )
        for r in rows
    ]
    resp = CellsResponse(country=country, month=month, cells=grid)
    _cache[cache_key] = resp
    return resp


# ── /summary ─────────────────────────────────────────────────────────
@router.get("/summary", response_model=SummaryResponse)
def summary(
    year_start: int = Query(2000, ge=2000, le=2025),
    year_end: int = Query(2025, ge=2000, le=2025),
    include_partial: bool = Query(False),
):
    """KPI summary per country."""
    partial_clause = "" if include_partial else "AND partial = false"

    cache_key = f"summary:{year_start}:{year_end}:{include_partial}"
    if cache_key in _cache:
        return _cache[cache_key]

    rows = query(
        f"""
        WITH monthly AS (
            SELECT country, year::int, month,
                   sum(harm) AS harm
            FROM {TABLE}
            WHERE year >= %s AND year <= %s {partial_clause}
            GROUP BY country, year, month
        ),
        peaks AS (
            SELECT country,
                   sum(harm)                                       AS total_harm,
                   count(DISTINCT year)                            AS years_covered,
                   sum(harm) / NULLIF(count(DISTINCT year), 0)     AS avg_annual
            FROM monthly
            GROUP BY country
        ),
        top_months AS (
            SELECT DISTINCT ON (country) country, month AS peak_month, harm AS peak_harm
            FROM monthly
            ORDER BY country, harm DESC
        )
        SELECT p.country, p.total_harm, p.years_covered, p.avg_annual,
               t.peak_month, t.peak_harm
        FROM peaks p JOIN top_months t ON p.country = t.country
        ORDER BY p.country
        """,
        (year_start, year_end),
    )

    kpis = [
        SummaryKPI(
            country=r["country"],
            total_harm=round(float(r["total_harm"]), 0),
            peak_month=r["peak_month"],
            peak_harm=round(float(r["peak_harm"]), 0),
            avg_annual=round(float(r["avg_annual"]), 0),
            years_covered=r["years_covered"],
        )
        for r in rows
    ]
    resp = SummaryResponse(kpis=kpis)
    _cache[cache_key] = resp
    return resp


# ── /compare ─────────────────────────────────────────────────────────
@router.get("/compare", response_model=CompareResponse)
def compare(
    country: str = Query("Australia"),
    year_start: int = Query(2012, ge=2000, le=2025),
    year_end: int = Query(2025, ge=2000, le=2025),
    include_partial: bool = Query(False),
):
    """Compare raw MODIS vs harmonized VIIRS counts side-by-side.

    Since the DB only stores harmonized values (no raw `n` column),
    MODIS rows show their native counts and VIIRS_SNPP rows show the
    harmonized-to-MODIS-scale values.  The front-end explains the mapping.
    """
    _validate_country(country)
    partial_clause = "" if include_partial else "AND partial = false"

    cache_key = f"compare:{country}:{year_start}:{year_end}:{include_partial}"
    if cache_key in _cache:
        return _cache[cache_key]

    rows = query(
        f"""
        SELECT month, sensor, sum(harm) AS total
        FROM {TABLE}
        WHERE country = %s AND year >= %s AND year <= %s
              AND sensor IN ('MODIS', 'VIIRS_SNPP')
              {partial_clause}
        GROUP BY month, sensor
        ORDER BY month, sensor
        """,
        (country, year_start, year_end),
    )

    # Pivot: month → {modis, viirs/harmonized}
    month_data: dict[str, dict] = {}
    for r in rows:
        m = r["month"]
        if m not in month_data:
            month_data[m] = {"modis": None, "viirs": None, "harmonized": None}
        val = round(float(r["total"]), 1)
        if r["sensor"] == "MODIS":
            month_data[m]["modis"] = val
        elif r["sensor"] == "VIIRS_SNPP":
            # harm column IS the harmonized value for VIIRS
            month_data[m]["harmonized"] = val

    data = [
        ComparePoint(month=m, **month_data[m])
        for m in sorted(month_data.keys())
    ]
    resp = CompareResponse(country=country, data=data)
    _cache[cache_key] = resp
    return resp


# ── /export.csv ──────────────────────────────────────────────────────
@router.get("/export.csv")
def export_csv(
    country: str = Query("Australia"),
    year_start: int = Query(2000, ge=2000, le=2025),
    year_end: int = Query(2025, ge=2000, le=2025),
    include_partial: bool = Query(False),
    min_lat: Optional[float] = Query(None, ge=-90, le=90),
    max_lat: Optional[float] = Query(None, ge=-90, le=90),
    min_lon: Optional[float] = Query(None, ge=-180, le=180),
    max_lon: Optional[float] = Query(None, ge=-180, le=180),
):
    """Download fire data as CSV."""
    _validate_country(country)
    params: list = [country, year_start, year_end]
    partial_clause = "" if include_partial else "AND partial = false"
    bounds = _bounds_fragments(min_lat, max_lat, min_lon, max_lon, params)
    bounds_clause = f"AND {bounds}" if bounds else ""

    rows = query(
        f"""
        SELECT country, month, year::int, mon::int,
               lat_c + 0.125 AS lat_centre,
               lon_c + 0.125 AS lon_centre,
               harm, harm_lo, harm_hi, frp_sum,
               sensor, partial
        FROM {TABLE}
        WHERE country = %s AND year >= %s AND year <= %s
              {partial_clause} {bounds_clause}
        ORDER BY month, lat_c, lon_c
        """,
        params,
    )

    buf = io.StringIO()
    writer = csv.DictWriter(
        buf,
        fieldnames=[
            "country", "month", "year", "mon",
            "lat_centre", "lon_centre",
            "harm", "harm_lo", "harm_hi", "frp_sum",
            "sensor", "partial",
        ],
    )
    writer.writeheader()
    for r in rows:
        writer.writerow({
            "country": r["country"],
            "month": r["month"],
            "year": r["year"],
            "mon": r["mon"],
            "lat_centre": round(float(r["lat_centre"]), 4),
            "lon_centre": round(float(r["lon_centre"]), 4),
            "harm": round(float(r["harm"]), 2),
            "harm_lo": round(float(r["harm_lo"]), 2),
            "harm_hi": round(float(r["harm_hi"]), 2),
            "frp_sum": round(float(r["frp_sum"]), 1),
            "sensor": r["sensor"],
            "partial": r["partial"],
        })

    filename = f"burn_calendar_{country.replace(' ', '_')}_{year_start}_{year_end}.csv"
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
