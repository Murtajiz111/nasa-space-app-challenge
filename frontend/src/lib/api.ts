const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE = `${API_URL}/api/v1`;

export interface HealthResponse {
  status: string;
  database: string;
  row_count: number;
}

export interface CountryMeta {
  country: string;
  rows: number;
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
  year_min: number;
  year_max: number;
  sensors: string[];
}

export interface MetaResponse {
  countries: CountryMeta[];
  total_rows: number;
  partial_months_note: string;
}

export interface CalendarCell {
  year: number;
  mon: number;
  harm: number;
  harm_lo: number;
  harm_hi: number;
  partial: boolean;
}

export interface CalendarResponse {
  country: string;
  cells: CalendarCell[];
}

export interface TimeseriesPoint {
  month: string;
  harm: number;
  harm_lo: number;
  harm_hi: number;
  partial: boolean;
}

export interface TimeseriesResponse {
  country: string;
  data: TimeseriesPoint[];
}

export interface AnomalyPoint {
  year: number;
  mon: number;
  month: string;
  harm: number;
  median: number;
  anomaly: number;
  anomaly_pct: number;
  partial: boolean;
}

export interface AnomalyResponse {
  country: string;
  data: AnomalyPoint[];
}

export interface GridCell {
  lat_c: number;
  lon_c: number;
  harm: number;
  harm_lo: number;
  harm_hi: number;
  frp_sum: number;
  sensor: string;
  partial: boolean;
}

export interface CellsResponse {
  country: string;
  month: string;
  cells: GridCell[];
}

export interface SummaryKPI {
  country: string;
  total_harm: number;
  peak_month: string;
  peak_harm: number;
  avg_annual: number;
  years_covered: number;
  trend_pct_per_decade: number | null;
}

export interface SummaryResponse {
  kpis: SummaryKPI[];
}

export interface ComparePoint {
  month: string;
  modis: number | null;
  viirs: number | null;
  harmonized: number | null;
}

export interface CompareResponse {
  country: string;
  data: ComparePoint[];
}

// Bounds filter
export interface BoundsFilter {
  min_lat?: number;
  max_lat?: number;
  min_lon?: number;
  max_lon?: number;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function buildParams(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export const api = {
  health: () => fetchJSON<HealthResponse>(`${BASE}/health`),

  meta: () => fetchJSON<MetaResponse>(`${BASE}/meta`),

  calendar: (country: string, yearStart = 2000, yearEnd = 2025, includePartial = false) =>
    fetchJSON<CalendarResponse>(
      `${BASE}/calendar${buildParams({ country, year_start: yearStart, year_end: yearEnd, include_partial: includePartial })}`
    ),

  timeseries: (country: string, yearStart = 2000, yearEnd = 2025, includePartial = false, bounds?: BoundsFilter) =>
    fetchJSON<TimeseriesResponse>(
      `${BASE}/timeseries${buildParams({ country, year_start: yearStart, year_end: yearEnd, include_partial: includePartial, ...bounds })}`
    ),

  anomaly: (country: string, yearStart = 2000, yearEnd = 2025, includePartial = false) =>
    fetchJSON<AnomalyResponse>(
      `${BASE}/anomaly${buildParams({ country, year_start: yearStart, year_end: yearEnd, include_partial: includePartial })}`
    ),

  cells: (country: string, month: string, bounds?: BoundsFilter) =>
    fetchJSON<CellsResponse>(
      `${BASE}/cells${buildParams({ country, month, ...bounds })}`
    ),

  summary: (yearStart = 2000, yearEnd = 2025, includePartial = false) =>
    fetchJSON<SummaryResponse>(
      `${BASE}/summary${buildParams({ year_start: yearStart, year_end: yearEnd, include_partial: includePartial })}`
    ),

  compare: (country: string, yearStart = 2012, yearEnd = 2025, includePartial = false) =>
    fetchJSON<CompareResponse>(
      `${BASE}/compare${buildParams({ country, year_start: yearStart, year_end: yearEnd, include_partial: includePartial })}`
    ),

  exportCsvUrl: (country: string, yearStart = 2000, yearEnd = 2025, includePartial = false, bounds?: BoundsFilter) =>
    `${BASE}/export.csv${buildParams({ country, year_start: yearStart, year_end: yearEnd, include_partial: includePartial, ...bounds })}`,
};
