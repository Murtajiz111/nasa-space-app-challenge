# Architectural & Methodological Decisions

### MODIS + VIIRS Harmonized Burn Calendar — NASA Space Apps Challenge 2026

---

## 1. Harmonization Methodology

### Decision: Empirical Ratio Scaling over Black-Box ML
- **Baseline Formulation**: For each target country $c$ and calendar month $m \in [1, 12]$:
  $$\text{Ratio}(c, m) = \text{Median}\left(\frac{\text{VIIRS\_SNPP}}{\text{MODIS}}\right)$$
  $$\text{Harmonized}(t) = \frac{\text{VIIRS\_SNPP}(t)}{\text{Ratio}(c, m)}$$
- **Rationale**:
  - The 1,000m MODIS instrument (Terra/Aqua) forms a 25-year unbroken historical baseline (2000–2025).
  - VIIRS 375m (Suomi-NPP) launched in 2012 has ~7× smaller pixel area, recording 3×–5× more raw hotspot detections for identical fire events.
  - Applying uncalibrated VIIRS counts produces an artificial rupture in 2012, falsifying trend analyses for emergency managers and climate scientists.
  - Pure ratio scaling maintains zero bias across concurrent observation years (2012–2025) while leaving historical MODIS counts (2000–2011) intact.

### Decision: NOAA-20 Independence
- **Rule**: NOAA-20 (2018–2025) observations are **never** added to Suomi-NPP counts.
- **Rationale**: NOAA-20 flies an identical orbit 50 minutes behind Suomi-NPP. Adding both counts would introduce double-counting and inflate fire severity. NOAA-20 is retained strictly as an independent transfer validation set.

### Decision: Uncertainty Bounds Formulation
- **Uncertainty Bounds**: Interquartile range ($p_{25}$ and $p_{75}$) of empirical scaling ratios:
  $$\text{Harm}_{\text{lo}} = \frac{\text{VIIRS\_Count}}{\text{Ratio}_{p75}}, \quad \text{Harm}_{\text{hi}} = \frac{\text{VIIRS\_Count}}{\text{Ratio}_{p25}}$$
- Evaluated validation:
  - **Australia**: 4.9% MdAPE (High reliability across savanna and bushland fire regimes)
  - **United States**: 6.8% MdAPE (High reliability across Western and Southeastern regimes)
  - **Canada**: 16.1% MdAPE (Summer mega-fires harmonize with high fidelity; winter months exhibit wider confidence intervals due to low sun angles, snow cover, and low sample density)

---

## 2. Backend Architecture

### Decision: psycopg2 Threaded Connection Pool with Auto-Reconnection
- **Problem**: When using asynchronous psycopg3 on Windows environments with remote cloud databases (Supabase ap-northeast-1 pooler), idle timeouts caused connection dropouts and blocking of the asyncio loop.
- **Solution**: Implemented `psycopg2` threaded connection pooling running inside FastAPI's native worker threadpool. Added an automatic one-time retry wrapper (`_reset_pool()`) that catches stale socket drops transparently without dropping client HTTP requests.
- **Caching**: 10-minute `TTLCache` with parameterized keys (`cal:{country}:{start}:{end}:{partial}`, `cells:{country}:{month}:{bounds}`) to eliminate redundant database roundtrips.

---

## 3. Frontend Architecture

### Decision: Dark Space-Observation HUD & Dual-Mode Calendar
- **NASA Mission Aesthetic**: Dark space palette (`#05070D` background, `#0B1020` glassmorphism panels, Space Grotesk / JetBrains Mono typography, MODIS electric blue `#4EA8FF`, VIIRS solar amber `#FFB000`).
- **Dual Calendar Modes**:
  1. **Radial Fire Wheel**: 12 radial spokes (Jan–Dec) with 26 concentric year rings (2000 to 2025). Peak fire seasons radiate outward.
  2. **Heatmap Matrix**: Traditional Year × Month grid with color-coded intensity, distinct 2012 sensor transition marker, and dashed borders for pre-Aqua partial records.
- **Deck.gl + MapLibre GL Integration**: Renders 0.25° gridded cells with interactive tooltips, extruded 3D columns, and free CARTO Dark Matter basemap tiles (zero paid API keys required).
- **Zustand State Synchronization**: Clicking any cell in the radial wheel or heatmap matrix immediately synchronizes the MapLibre viewport, timeline scrubber, and anomaly engine.
