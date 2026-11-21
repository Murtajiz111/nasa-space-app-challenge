"""Pydantic v2 schemas for request validation and response serialisation."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ── Query parameters ────────────────────────────────────────────────
class CountryParam(BaseModel):
    country: str = Field("Australia", description="Country filter")

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: str) -> str:
        allowed = {"Australia", "Canada", "United States"}
        if v not in allowed:
            raise ValueError(f"country must be one of {allowed}")
        return v


class BoundsParam(BaseModel):
    """Optional geographical bounding box (decimal degrees)."""
    min_lat: Optional[float] = Field(None, ge=-90, le=90)
    max_lat: Optional[float] = Field(None, ge=-90, le=90)
    min_lon: Optional[float] = Field(None, ge=-180, le=180)
    max_lon: Optional[float] = Field(None, ge=-180, le=180)

    @field_validator("max_lat")
    @classmethod
    def lat_order(cls, v: float | None, info) -> float | None:
        min_lat = info.data.get("min_lat")
        if v is not None and min_lat is not None and v < min_lat:
            raise ValueError("max_lat must be >= min_lat")
        return v

    @field_validator("max_lon")
    @classmethod
    def lon_order(cls, v: float | None, info) -> float | None:
        min_lon = info.data.get("min_lon")
        if v is not None and min_lon is not None and v < min_lon:
            raise ValueError("max_lon must be >= min_lon")
        return v


class DateRange(BaseModel):
    year_start: int = Field(2000, ge=2000, le=2025)
    year_end: int = Field(2025, ge=2000, le=2025)

    @field_validator("year_end")
    @classmethod
    def year_order(cls, v: int, info) -> int:
        ys = info.data.get("year_start")
        if ys is not None and v < ys:
            raise ValueError("year_end must be >= year_start")
        return v


class ExplorerQuery(CountryParam, BoundsParam, DateRange):
    include_partial: bool = Field(False, description="Include partial MODIS months")
    sensor: Optional[str] = Field(None, description="Filter by sensor")

    @field_validator("sensor")
    @classmethod
    def validate_sensor(cls, v: str | None) -> str | None:
        if v is not None:
            allowed = {"MODIS", "VIIRS_SNPP", "VIIRS_NOAA20"}
            if v not in allowed:
                raise ValueError(f"sensor must be one of {allowed}")
        return v


# ── Response models ─────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    database: str
    row_count: int


class CountryMeta(BaseModel):
    country: str
    rows: int
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float
    year_min: int
    year_max: int
    sensors: list[str]


class MetaResponse(BaseModel):
    countries: list[CountryMeta]
    total_rows: int
    partial_months_note: str


class CalendarCell(BaseModel):
    year: int
    mon: int
    harm: float
    harm_lo: float
    harm_hi: float
    partial: bool


class CalendarResponse(BaseModel):
    country: str
    cells: list[CalendarCell]


class TimeseriesPoint(BaseModel):
    month: str
    harm: float
    harm_lo: float
    harm_hi: float
    partial: bool


class TimeseriesResponse(BaseModel):
    country: str
    data: list[TimeseriesPoint]


class AnomalyPoint(BaseModel):
    year: int
    mon: int
    month: str
    harm: float
    median: float
    anomaly: float
    anomaly_pct: float
    partial: bool


class AnomalyResponse(BaseModel):
    country: str
    data: list[AnomalyPoint]


class GridCell(BaseModel):
    lat_c: float
    lon_c: float
    harm: float
    harm_lo: float
    harm_hi: float
    frp_sum: float
    sensor: str
    partial: bool


class CellsResponse(BaseModel):
    country: str
    month: str
    cells: list[GridCell]


class SummaryKPI(BaseModel):
    country: str
    total_harm: float
    peak_month: str
    peak_harm: float
    avg_annual: float
    years_covered: int
    trend_pct_per_decade: Optional[float] = None


class SummaryResponse(BaseModel):
    kpis: list[SummaryKPI]


class ComparePoint(BaseModel):
    month: str
    modis: Optional[float] = None
    viirs: Optional[float] = None
    harmonized: Optional[float] = None


class CompareResponse(BaseModel):
    country: str
    data: list[ComparePoint]
