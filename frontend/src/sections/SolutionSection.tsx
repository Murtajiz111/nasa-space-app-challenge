import { useState } from 'react';
import { ShieldCheck, BarChart3, CheckCircle2 } from 'lucide-react';

const VALIDATION_METRICS = [
  {
    country: 'Australia',
    mdape: 4.9,
    status: 'Optimal',
    confidence: 'Very High',
    description: 'Dry, arid fire regimes produce remarkably consistent hotspot scaling between sensors across all calendar seasons.',
    color: '#34d399',
    ratios: [3.12, 3.05, 2.98, 3.15, 3.22, 3.35, 3.42, 3.38, 3.25, 3.18, 3.14, 3.09],
  },
  {
    country: 'United States',
    mdape: 6.8,
    status: 'Optimal',
    confidence: 'High',
    description: 'Western wildfire season and prescribed burning in the Southeast harmonize robustly with low median percentage error.',
    color: 'var(--modis)',
    ratios: [3.45, 3.38, 3.52, 3.61, 3.55, 3.48, 3.42, 3.39, 3.44, 3.51, 3.58, 3.49],
  },
  {
    country: 'Canada',
    mdape: 16.1,
    status: 'Honest Disclosure',
    confidence: 'Moderate (Summer High)',
    description: 'Summer mega-fires harmonize with high accuracy. Winter months exhibit higher uncertainty due to low solar angles, snow cover, and fewer fire detections.',
    color: 'var(--viirs)',
    ratios: [4.15, 4.30, 3.85, 3.42, 3.18, 2.95, 2.88, 3.02, 3.35, 3.75, 4.20, 4.45],
  },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SolutionSection() {
  const [activeCountryIdx, setActiveCountryIdx] = useState(0);
  const activeCountry = VALIDATION_METRICS[activeCountryIdx];

  return (
    <section id="solution" className="py-20 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--viirs)] bg-[rgba(255,176,0,0.1)] px-2.5 py-1 rounded border border-[rgba(255,176,0,0.25)]">
          SECTION 02 // CALIBRATION & METHODOLOGY
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
        The Harmonization Method: Empirical Ratio Scaling
      </h2>
      <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
        Rather than introducing complex black-box parameters that drift over 25 years, our baseline
        harmonization leverages concurrent monthly observations (2012–2025) to map VIIRS detections
        into the validated MODIS-equivalent baseline.
      </p>

      {/* Methodology Formula HUD */}
      <div className="mt-10 glass-panel p-6 border-l-4 border-l-emerald-400">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Harmonization Mathematical Model
            </h3>
            <div className="mt-4 p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] font-mono text-sm leading-relaxed space-y-2 text-[var(--text-primary)]">
              <div className="text-[var(--text-secondary)]"># 1. Monthly empirical ratio per country c and calendar month m:</div>
              <div className="text-[var(--modis)]">ratio(c, m) = median(VIIRS_SNPP / MODIS)</div>
              <div className="text-[var(--text-secondary)] mt-2"># 2. Harmonized hotspot count:</div>
              <div className="text-[var(--viirs)]">harm = VIIRS_SNPP_count / ratio(c, m)</div>
              <div className="text-[var(--text-secondary)] mt-2"># 3. Uncertainty interval (Interquartile Range p25 – p75):</div>
              <div className="text-emerald-400">harm_lo = VIIRS_count / ratio_p75 | harm_hi = VIIRS_count / ratio_p25</div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
              * Note: MODIS observations (2000–2011) remain unmodified (harm = MODIS count, uncertainty = [harm, harm]).
              Aqua joined Terra in July 2002; records before July 2002 are tagged as partial.
            </p>
          </div>

          <div className="flex flex-col justify-between p-4 rounded-lg bg-[rgba(11,24,55,0.4)] border border-[var(--border)]">
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-[var(--text-muted)]">Independent Validation</span>
              <h4 className="text-base font-bold text-[var(--text-primary)] mt-1">NOAA-20 Satellite</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                NOAA-20 (2018–2025) carries an identical VIIRS sensor 50 minutes behind SNPP.
                In adherence to NASA guidelines, NOAA-20 is <strong>never added to SNPP counts</strong> to prevent double-counting;
                instead, it is used strictly for independent transfer validation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Zero Double-Counting
            </div>
          </div>
        </div>
      </div>

      {/* Validation Gauges for 3 Countries */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-display text-[var(--text-primary)]">
            Validation Error by Country (Median Absolute Percentage Error)
          </h3>
          <div className="flex gap-2">
            {VALIDATION_METRICS.map((vm, idx) => (
              <button
                key={vm.country}
                type="button"
                onClick={() => setActiveCountryIdx(idx)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                  activeCountryIdx === idx
                    ? 'bg-[var(--modis)] text-black font-bold'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border)]'
                }`}
              >
                {vm.country}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALIDATION_METRICS.map((m, idx) => {
            const isSelected = activeCountryIdx === idx;
            return (
              <div
                key={m.country}
                onClick={() => setActiveCountryIdx(idx)}
                className={`glass-panel p-6 cursor-pointer transition-all ${
                  isSelected ? 'border-[var(--modis)] shadow-[0_0_20px_rgba(78,168,255,0.2)]' : 'hover:border-[var(--border)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{m.country}</span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold font-mono tracking-tight" style={{ color: m.color }}>
                    {m.mdape}%
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">MdAPE</span>
                </div>

                {/* Progress bar gauge */}
                <div className="w-full bg-[var(--bg-deep)] h-2 rounded-full overflow-hidden my-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((m.mdape / 25) * 100, 100)}%`,
                      backgroundColor: m.color,
                    }}
                  />
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2">{m.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Empirical Calibration Ratios Chart */}
      <div className="mt-8 glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
          <div>
            <h4 className="text-base font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--modis)]" />
              Monthly Calibration Ratios: {activeCountry.country} (VIIRS / MODIS)
            </h4>
            <span className="text-xs text-[var(--text-muted)]">
              Higher ratio indicates greater VIIRS sub-pixel sensitivity relative to MODIS for that month.
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            Mean ratio: {(activeCountry.ratios.reduce((a, b) => a + b, 0) / 12).toFixed(2)}×
          </span>
        </div>

        <div className="h-40 flex items-end gap-2 pt-4">
          {activeCountry.ratios.map((ratio, mIdx) => {
            const heightPct = (ratio / 5.0) * 100;
            return (
              <div key={mIdx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[var(--bg-deep)] border border-[var(--border)] px-2 py-0.5 rounded text-[10px] font-mono pointer-events-none whitespace-nowrap z-20">
                  <span className="text-[var(--text-primary)] font-bold">{ratio.toFixed(2)}×</span>
                </div>
                {/* Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full rounded-t bg-gradient-to-t from-[var(--bg-card)] to-[var(--modis)] group-hover:to-[var(--viirs)] transition-all"
                />
                <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1.5">{MONTH_NAMES[mIdx]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
