import { useStore } from '../store/useStore';
import { RadialCalendar } from '../components/RadialCalendar';
import { HeatmapCalendar } from '../components/HeatmapCalendar';
import { AnomalyChart } from '../components/AnomalyChart';
import { CountrySelector } from '../components/CountrySelector';
import { CircleDot, Grid, Flame } from 'lucide-react';

export function BurnCalendarSection() {
  const { calendarMode, setCalendarMode, country, selectedMonth } = useStore();

  return (
    <section id="calendar" className="py-20 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--viirs)] bg-[rgba(255,176,0,0.1)] px-2.5 py-1 rounded border border-[rgba(255,176,0,0.25)]">
              SECTION 04 // 25-YEAR BURN CALENDAR
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Historical Burning Activity Matrix (2000–2025)
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-2xl">
            Switch between the Concentric Radial Wheel and Year × Month Heatmap.
            Click any month or ring segment to synchronize the Geospatial Explorer and Anomaly Engine.
          </p>
        </div>

        {/* View Mode Switch & Country */}
        <div className="flex items-center gap-3 flex-wrap">
          <CountrySelector />
          <div className="flex rounded-lg bg-[var(--bg-deep)] p-0.5 border border-[var(--border)] text-xs font-mono">
            <button
              type="button"
              onClick={() => setCalendarMode('heatmap')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                calendarMode === 'heatmap'
                  ? 'bg-gradient-to-r from-[var(--modis)] to-[#2563eb] text-white font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Heatmap Matrix
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('radial')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                calendarMode === 'radial'
                  ? 'bg-[var(--viirs)] text-black font-semibold shadow-[0_0_12px_rgba(255,176,0,0.4)]'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              Radial Fire Wheel
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="glass-panel p-6 relative">
        {/* Selected Month Header HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[var(--viirs)]" />
            <span className="text-sm font-bold text-[var(--text-primary)] font-display">
              {country} Burn Activity: {calendarMode === 'radial' ? 'Concentric Radial Rings' : 'Year × Month Heatmap'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[var(--text-muted)]">Active Synchronization:</span>
            <span className="px-2 py-0.5 rounded bg-[rgba(78,168,255,0.15)] text-[var(--modis)] border border-[rgba(78,168,255,0.3)] font-bold">
              {selectedMonth ?? 'Click any cell'}
            </span>
          </div>
        </div>

        {/* View Component Rendering */}
        <div className="py-2">
          {calendarMode === 'radial' ? (
            <RadialCalendar />
          ) : (
            <HeatmapCalendar />
          )}
        </div>
      </div>

      {/* Anomaly Analysis Engine */}
      <div className="mt-8">
        <AnomalyChart />
      </div>
    </section>
  );
}
