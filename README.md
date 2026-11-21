# MODIS + VIIRS Harmonized Burn Calendar
### NASA Space Apps Challenge 2026 — Earth Observation Mission

> **"Twenty-five years of fire. One consistent record."**

An interactive, science-grade wildfire observation platform that bridges the 2012 sensor transition breakpoint between NASA MODIS (1,000m resolution, 2000–2025) and VIIRS (375m resolution, 2012–2025), delivering continuous, calibrated wildfire activity analytics across **Australia**, **Canada**, and the **United States**.

---

## Mission Highlights

- **25-Year Unbroken Fire Record (2000–2025)**: Over 1.42 million gridded 0.25-degree monthly observations indexed in Supabase PostgreSQL.
- **Empirical Harmonization**: Converts VIIRS 375m observations into the calibrated MODIS-equivalent baseline using monthly country-specific scaling ratios.
- **Dual-Mode Burn Calendar**:
  - **Radial Fire Wheel**: 12 monthly spokes with 26 concentric year rings; fire season peaks radiate outwards.
  - **Heatmap Matrix**: Complete Year × Month grid highlighting the 2012 sensor transition breakpoint and early partial records (pre-Aqua July 2002).
- **Interactive Geospatial Explorer**: MapLibre GL JS + deck.gl 9 rendering 0.25° cells with hover tooltips, 3D extruded columns, uncertainty intervals (`[harm_lo, harm_hi]`), custom coordinate bounding boxes, and historical disaster presets (e.g. 2019–20 Australia Black Summer, 2023 Canada Mega-Fires, 2020 California Fire Storm).
- **Historical Anomaly Engine**: Leave-one-out historical median baseline per calendar month with positive (+orange) and negative (-blue) departure metrics.
- **Science-Grade CSV Export**: Downloadable datasets including harmonized counts, uncertainty bounds, FRP sums, sensor identification, and cell centre coordinates.
- **Zero Paid API Keys**: Uses open NASA FIRMS data, free CARTO Dark Matter vector tiles, and client-side Canvas 3D rendering.

---

## Validation & Accuracy Metrics

| Target Region | Median Absolute Percentage Error (MdAPE) | Uncertainty Coverage (p25–p75) | Primary Fire Regime |
|---|---:|:---:|---|
| **Australia** | **4.9%** | Robust | Savanna woodland & bushland |
| **United States** | **6.8%** | Robust | Western coniferous & SE prescribed |
| **Canada** | **16.1%** | Moderate (Winter Caveat) | Boreal forest & tundra |

*Note: In adherence to NASA guidelines, VIIRS NOAA-20 observations (2018–2025) operate strictly as an independent validation set and are never summed into Suomi-NPP counts to prevent artificial double-counting.*

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, MapLibre GL JS, deck.gl 9, D3.js, TanStack Query, Zustand, Lucide React.
- **Backend**: Python 3.14 / 3.11+, FastAPI, PostgreSQL (Supabase Session Pooler), psycopg2 connection pooling, Pydantic v2, ORJSON, GZip compression, TTLCache.
- **Database**: Supabase PostgreSQL (`hotspots_harmonized` table with 1,424,490 rows).

---

## Repository Structure

```text
burn-calendar/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application & lifespan
│   │   ├── config.py        # Environment settings (database, cache)
│   │   ├── db.py            # psycopg2 connection pool with auto-reconnect
│   │   ├── schemas.py       # Pydantic v2 validation models
│   │   └── routers/
│   │       └── fire.py      # /api/v1/ endpoints (health, calendar, cells, etc.)
│   ├── tests/
│   │   ├── check_db.py      # Database schema & count verification
│   │   └── test_endpoints.py# Integration test suite for all 9 API endpoints
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # MapViewer, RadialCalendar, HeatmapCalendar, etc.
│   │   ├── sections/        # Hero, Problem, Solution, Explorer, Reliability
│   │   ├── hooks/           # useFireData React Query hooks
│   │   ├── store/           # Zustand reactive state store
│   │   ├── styles/          # globals.css with NASA Mission palette & Tailwind
│   │   ├── lib/             # api.ts typed fetch client
│   │   ├── App.tsx          # Root application
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docs/
├── DECISIONS.md             # Methodological & architectural log
└── README.md
```

---

## Quickstart & Local Execution

### 1. Backend Setup & Run

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Documentation: `http://127.0.0.1:8000/api/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

### 2. Run Integration Tests

```bash
cd backend
python tests/test_endpoints.py
```

### 3. Frontend Setup & Run

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://127.0.0.1:5173` in your browser.

---

## Data Provenance & Attribution

Data courtesy of the **NASA Earth Science Data Systems (ESDS)** and **Fire Information for Resource Management System (FIRMS)**:
- MODIS Collection 6.1 (Terra MOD14 / Aqua MYD14)
- VIIRS 375m Active Fire (Suomi-NPP VNP14IMG / NOAA-20 VJ114IMG)
