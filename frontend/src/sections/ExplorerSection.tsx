import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTimeseries, useCells } from '../hooks/useFireData';
import { MapViewer } from '../components/MapViewer';
import { CountrySelector } from '../components/CountrySelector';
import { YearRangeSlider } from '../components/YearRangeSlider';
import { api } from '../lib/api';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Filter,
  Calendar,
  Layers,
  MapPin,
  X,
} from 'lucide-react';

export function ExplorerSection() {
  const {
    country,
    yearStart,
    yearEnd,
    selectedMonth,
    setSelectedMonth,
    sensorView,
    setSensorView,
    bounds,
    setBounds,
    clearBounds,
    includePartial,
  } = useStore();

  const { data: timeseriesData } = useTimeseries();
  const { data: cellsData } = useCells();

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBoundsInputs, setShowBoundsInputs] = useState(false);

  // Manual bounding box inputs
  const [tempMinLat, setTempMinLat] = useState<string>('');
  const [tempMaxLat, setTempMaxLat] = useState<string>('');
  const [tempMinLon, setTempMinLon] = useState<string>('');
  const [tempMaxLon, setTempMaxLon] = useState<string>('');

  // Default month if null
  useEffect(() => {
    if (!selectedMonth && timeseriesData?.data?.length) {
      // Pick the peak month by default or recent month
      const peak = [...timeseriesData.data].sort((a, b) => b.harm - a.harm)[0];
      setSelectedMonth(peak ? peak.month : timeseriesData.data[0].month);
    }
  }, [timeseriesData, selectedMonth, setSelectedMonth]);

  // All months in current date range
  const monthsList = timeseriesData?.data?.map((d) => d.month) || [];
  const currentMonthIdx = selectedMonth ? monthsList.indexOf(selectedMonth) : -1;

  // Active month data summary
  const currentPoint = timeseriesData?.data?.find((d) => d.month === selectedMonth);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || monthsList.length === 0) return;

    const interval = setInterval(() => {
      const activeIdx = selectedMonth ? monthsList.indexOf(selectedMonth) : -1;
      if (activeIdx === -1 || activeIdx >= monthsList.length - 1) {
        setIsPlaying(false);
        setSelectedMonth(monthsList[0]);
      } else {
        setSelectedMonth(monthsList[activeIdx + 1]);
      }
    }, 850);

    return () => clearInterval(interval);
  }, [isPlaying, monthsList, selectedMonth, setSelectedMonth]);

  const handleStepPrev = () => {
    if (currentMonthIdx > 0) {
      setSelectedMonth(monthsList[currentMonthIdx - 1]);
    }
  };

  const handleStepNext = () => {
    if (currentMonthIdx < monthsList.length - 1) {
      setSelectedMonth(monthsList[currentMonthIdx + 1]);
    }
  };

  const handleApplyBounds = () => {
    const min_lat = tempMinLat ? parseFloat(tempMinLat) : undefined;
    const max_lat = tempMaxLat ? parseFloat(tempMaxLat) : undefined;
    const min_lon = tempMinLon ? parseFloat(tempMinLon) : undefined;
    const max_lon = tempMaxLon ? parseFloat(tempMaxLon) : undefined;

    setBounds({ min_lat, max_lat, min_lon, max_lon });
  };

  const handleClearBounds = () => {
    setTempMinLat('');
    setTempMaxLat('');
    setTempMinLon('');
    setTempMaxLon('');
    clearBounds();
  };

  const hasActiveBounds = Boolean(
    bounds.min_lat !== undefined ||
    bounds.max_lat !== undefined ||
    bounds.min_lon !== undefined ||
    bounds.max_lon !== undefined
  );

  return (
    <section id="explorer" className="py-20 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--modis)] bg-[rgba(78,168,255,0.1)] px-2.5 py-1 rounded border border-[rgba(78,168,255,0.25)]">
              SECTION 03 // GEOSPATIAL EXPLORER
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Interactive Hotspot Grid & Timeline
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-2xl">
            Explore 0.25-degree cell grids from 2000 to 2025. Filter by spatial coordinates,
            scrub through historical fire seasons, and inspect uncertainty intervals.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <CountrySelector />
        </div>
      </div>

      {/* Explorer Controls Toolbar */}
      <div className="glass-panel p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Sensor Mode Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[var(--modis)]" /> Sensor:
          </span>
          <div className="flex rounded-lg bg-[var(--bg-deep)] p-0.5 border border-[var(--border)] text-xs font-mono">
            <button
              type="button"
              onClick={() => setSensorView('harmonized')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                sensorView === 'harmonized'
                  ? 'bg-gradient-to-r from-[var(--modis)] to-[#2563eb] text-white font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Harmonized
            </button>
            <button
              type="button"
              onClick={() => setSensorView('modis')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                sensorView === 'modis'
                  ? 'bg-[var(--modis)] text-black font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              MODIS
            </button>
            <button
              type="button"
              onClick={() => setSensorView('viirs')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                sensorView === 'viirs'
                  ? 'bg-[var(--viirs)] text-black font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              VIIRS
            </button>
          </div>
        </div>

        {/* Year Range Filter */}
        <div className="w-full">
          <YearRangeSlider />
        </div>

        {/* Spatial Bounding Box Toggle & Export */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowBoundsInputs(!showBoundsInputs)}
            className={`px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
              hasActiveBounds
                ? 'bg-[rgba(78,168,255,0.2)] text-[var(--modis)] border-[var(--modis)]'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {hasActiveBounds ? 'BBox Filter Active' : 'Custom BBox'}
          </button>

          <a
            href={api.exportCsvUrl(country, yearStart, yearEnd, includePartial, bounds)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg text-xs font-mono bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--modis)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--modis)]" />
            Download CSV
          </a>
        </div>
      </div>

      {/* Collapsible Bounding Box Input Drawer */}
      {showBoundsInputs && (
        <div className="glass-panel p-4 mb-4 border border-[var(--modis)] animate-fadeIn">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
            <span className="text-xs font-mono font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[var(--modis)]" />
              Manual Coordinate Bounding Box (Decimal Degrees)
            </span>
            <button
              type="button"
              onClick={() => setShowBoundsInputs(false)}
              className="text-[var(--text-muted)] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-[var(--text-muted)] block mb-1">Min Latitude</label>
              <input
                type="number"
                step="0.25"
                placeholder="-45.0"
                value={tempMinLat}
                onChange={(e) => setTempMinLat(e.target.value)}
                className="w-full p-2 rounded bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--modis)] outline-none"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">Max Latitude</label>
              <input
                type="number"
                step="0.25"
                placeholder="-10.0"
                value={tempMaxLat}
                onChange={(e) => setTempMaxLat(e.target.value)}
                className="w-full p-2 rounded bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--modis)] outline-none"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">Min Longitude</label>
              <input
                type="number"
                step="0.25"
                placeholder="110.0"
                value={tempMinLon}
                onChange={(e) => setTempMinLon(e.target.value)}
                className="w-full p-2 rounded bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--modis)] outline-none"
              />
            </div>
            <div>
              <label className="text-[var(--text-muted)] block mb-1">Max Longitude</label>
              <input
                type="number"
                step="0.25"
                placeholder="155.0"
                value={tempMaxLon}
                onChange={(e) => setTempMaxLon(e.target.value)}
                className="w-full p-2 rounded bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--modis)] outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 text-xs font-mono">
            {hasActiveBounds && (
              <button
                type="button"
                onClick={handleClearBounds}
                className="px-3 py-1.5 rounded bg-[var(--bg-deep)] text-red-400 border border-red-500/30 hover:bg-red-500/10 cursor-pointer"
              >
                Clear Coordinates
              </button>
            )}
            <button
              type="button"
              onClick={handleApplyBounds}
              className="px-4 py-1.5 rounded bg-[var(--modis)] text-black font-semibold hover:brightness-110 cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* Main Map Visualization */}
      <div className="relative">
        <MapViewer />

        {/* Floating Insight HUD Panel (Requirement 7.D) */}
        {currentPoint && (
          <div className="absolute top-4 right-4 z-20 glass-panel p-4 max-w-xs text-xs font-mono pointer-events-none hidden lg:block border border-[var(--border)] shadow-[0_0_25px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Active Observation</span>
              <span className="text-[var(--modis)] font-bold">{selectedMonth}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">National Total:</span>
                <span className="text-base font-bold text-[var(--viirs)]">
                  {currentPoint.harm.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">95% Uncertainty:</span>
                <span className="text-[var(--text-secondary)]">
                  ±{Math.round(((currentPoint.harm_hi - currentPoint.harm_lo) / (2 * currentPoint.harm || 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">Grid Cell Footprints:</span>
                <span className="text-[var(--text-primary)]">
                  {cellsData?.cells.length.toLocaleString() ?? '—'}
                </span>
              </div>
            </div>

            {currentPoint.partial && (
              <div className="mt-3 p-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300">
                ⚠️ Partial: Terra only (pre-Aqua July 2002)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Timeline Scrubbing Bar */}
      <div className="mt-4 glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-[var(--modis)] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(78,168,255,0.4)]"
              title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            </button>

            {/* Step Controls */}
            <button
              type="button"
              onClick={handleStepPrev}
              disabled={currentMonthIdx <= 0}
              className="p-1.5 rounded bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleStepNext}
              disabled={currentMonthIdx >= monthsList.length - 1}
              className="p-1.5 rounded bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Selected Month Display */}
            <div className="flex items-center gap-2 pl-2">
              <Calendar className="w-4 h-4 text-[var(--viirs)]" />
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {selectedMonth ?? 'Scrubbing...'}
              </span>
            </div>
          </div>

          <span className="text-[var(--text-muted)]">
            Month {currentMonthIdx + 1} of {monthsList.length}
          </span>
        </div>

        {/* Timeline Slider with Peak Sparkline */}
        <div className="relative pt-2">
          <input
            type="range"
            min={0}
            max={Math.max(monthsList.length - 1, 0)}
            value={currentMonthIdx >= 0 ? currentMonthIdx : 0}
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (monthsList[idx]) {
                setSelectedMonth(monthsList[idx]);
              }
            }}
            className="w-full accent-[var(--modis)] cursor-pointer h-2 bg-[var(--bg-deep)] rounded-lg appearance-none"
          />

          {/* Decade markers */}
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mt-1.5">
            <span>2000</span>
            <span>2005</span>
            <span>2010</span>
            <span className="text-[var(--viirs)] font-bold">2012 (VIIRS)</span>
            <span>2015</span>
            <span>2020</span>
            <span>2025</span>
          </div>
        </div>
      </div>
    </section>
  );
}
