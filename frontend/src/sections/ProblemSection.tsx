import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ProblemSection() {
  const [showHarmonized, setShowHarmonized] = useState(false);

  return (
    <section id="problem" className="py-20 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--modis)] bg-[rgba(78,168,255,0.1)] px-2.5 py-1 rounded border border-[rgba(78,168,255,0.25)]">
          SECTION 01 // THE SENSOR TRANSITION
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
        Why Raw Satellite Hotspots Cannot Be Compared
      </h2>
      <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
        In 2012, NASA launched the VIIRS sensor on Suomi-NPP. Suddenly, wildfire hotspot counts
        tripled or quadrupled overnight — not because fires grew worse, but because our instruments changed.
      </p>

      {/* Sensor Resolution Visual Breakdown */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MODIS Card */}
        <div className="glass-panel p-6 border-l-4 border-l-[var(--modis)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="sensor-badge modis font-mono">MODIS (Terra & Aqua)</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">2000 – Present</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">1,000m (1 km) Spatial Resolution</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              Instruments scan at 1km nadir resolution. Multiple small fires within the same 1km² footprint
              collapse into a <em>single detected hotspot</em>. Fires below ~100m² often go unflagged.
            </p>

            {/* Resolution Box Representation */}
            <div className="mt-6 p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] flex flex-col items-center">
              <div className="w-36 h-36 rounded border-2 border-[var(--modis)] bg-[rgba(78,168,255,0.08)] flex items-center justify-center relative">
                <span className="text-xs font-mono text-[var(--modis)] font-semibold">1 MODIS Pixel (1 km²)</span>
                <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
                <div className="absolute w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] mt-2">
                1 fire hotspot registered for entire 1,000,000 m² footprint
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]">
            Equatorial Crossing: 10:30 AM (Terra) & 1:30 PM (Aqua)
          </div>
        </div>

        {/* VIIRS Card */}
        <div className="glass-panel p-6 border-l-4 border-l-[var(--viirs)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="sensor-badge viirs font-mono">VIIRS (Suomi-NPP)</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">2012 – Present</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">375m Spatial Resolution</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              VIIRS I-band sensors have ~7× smaller pixel area than MODIS. What was one MODIS pixel
              is split into 7 distinct VIIRS pixels, detecting smaller smoldering fronts and night-time burning.
            </p>

            {/* Resolution Box Representation */}
            <div className="mt-6 p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] flex flex-col items-center">
              <div className="w-36 h-36 rounded border border-[var(--border)] grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 bg-[rgba(255,176,0,0.05)]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-[rgba(255,176,0,0.4)] rounded-sm bg-[rgba(255,176,0,0.1)] flex items-center justify-center relative"
                  >
                    {[0, 2, 4, 7].includes(i) && (
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] mt-2">
                Up to 7 distinct VIIRS hotspots for the exact same physical fire
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]">
            Equatorial Crossing: 1:30 PM (Suomi-NPP) & 1:30 PM (NOAA-20)
          </div>
        </div>
      </div>

      {/* The 2012 Rupture Interactive Graph Illustration */}
      <div className="mt-10 glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h4 className="text-lg font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--viirs)]" />
              The 2012 Sensor Transition Rupture
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Simulated annual national hotspot total demonstrating the artificial jump in raw counts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-muted)]">Calibration:</span>
            <button
              type="button"
              onClick={() => setShowHarmonized(!showHarmonized)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                showHarmonized
                  ? 'bg-[var(--modis)] text-black font-semibold shadow-[0_0_12px_rgba(78,168,255,0.4)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {showHarmonized ? 'Showing Harmonized Series (Continuous)' : 'Showing Raw Sensor Counts (Broken)'}
            </button>
          </div>
        </div>

        {/* Conceptual Bar Graph of 2000-2025 */}
        <div className="mt-6 pt-2">
          <div className="h-44 w-full flex items-end gap-1 sm:gap-2">
            {Array.from({ length: 26 }, (_, i) => {
              const year = 2000 + i;
              const isPre2012 = year < 2012;
              const isTransition = year === 2012;

              // Normalized baseline height (e.g. 50-80)
              let heightPct = 35 + ((Math.sin(i * 0.9) + 1) * 20);

              // Raw jump after 2012 if not harmonized
              if (!isPre2012 && !showHarmonized) {
                heightPct = heightPct * 2.8; // Artificial ~3x jump in raw VIIRS counts
              }

              return (
                <div key={year} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Transition flag */}
                  {isTransition && (
                    <div className="absolute top-0 flex flex-col items-center">
                      <span className="text-[9px] font-mono text-[var(--viirs)] font-bold px-1 rounded bg-[rgba(255,176,0,0.2)] border border-[rgba(255,176,0,0.4)] whitespace-nowrap">
                        VIIRS Launch
                      </span>
                      <div className="w-px h-28 bg-[var(--viirs)] border-dashed border-l opacity-60" />
                    </div>
                  )}

                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[var(--bg-deep)] border border-[var(--border)] px-2 py-1 rounded text-[10px] font-mono pointer-events-none whitespace-nowrap z-20">
                    <span className="text-[var(--text-secondary)]">{year}: </span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {Math.round(heightPct * 1200).toLocaleString()} hotspots
                    </span>
                    <span className="block text-[9px] text-[var(--text-muted)]">
                      {isPre2012 ? 'MODIS' : (showHarmonized ? 'Harmonized (MODIS-equiv)' : 'Raw VIIRS SNPP')}
                    </span>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${Math.min(heightPct, 95)}%` }}
                    className={`w-full rounded-t transition-all duration-500 ${
                      isPre2012
                        ? 'bg-[var(--modis)] opacity-85 group-hover:opacity-100'
                        : showHarmonized
                        ? 'bg-gradient-to-t from-[var(--modis)] to-[#93c5fd] opacity-85 group-hover:opacity-100'
                        : 'bg-gradient-to-t from-[var(--viirs)] to-red-500 opacity-90 group-hover:opacity-100 shadow-[0_0_8px_rgba(255,176,0,0.3)]'
                    }`}
                  />
                  <span className={`text-[9px] font-mono mt-1 ${isTransition ? 'text-[var(--viirs)] font-bold' : 'text-[var(--text-muted)]'}`}>
                    {year % 5 === 0 ? `'${String(year).slice(2)}` : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mt-4 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[var(--modis)]" /> MODIS Era (2000–2011)
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${showHarmonized ? 'bg-[#93c5fd]' : 'bg-[var(--viirs)]'}`} />
                {showHarmonized ? 'Harmonized VIIRS (MODIS-equivalent)' : 'Raw VIIRS SNPP (Uncalibrated +280%)'}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              {showHarmonized ? '✓ Consistent 25-year trend line' : '⚠️ False fire intensification anomaly'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
