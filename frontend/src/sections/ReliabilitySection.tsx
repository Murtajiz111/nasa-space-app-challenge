import { ShieldCheck, AlertTriangle, BookOpen, ExternalLink, Award } from 'lucide-react';

export function ReliabilitySection() {
  return (
    <section id="reliability" className="py-20 px-4 max-w-6xl mx-auto border-t border-[var(--border)]">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-[rgba(52,211,153,0.1)] px-2.5 py-1 rounded border border-[rgba(52,211,153,0.25)]">
          SECTION 05 // RELIABILITY & CREDITS
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
        Validation, Data Limitations & Citations
      </h2>
      <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
        Science-grade transparency: how uncertainty intervals are computed, critical caveats for land managers,
        and official data provenance from NASA Earth Science Data Systems.
      </p>

      {/* Grid of Rigor, Limitations, & Attributions */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Validation & Uncertainty Card */}
        <div className="glass-panel p-6 border-l-4 border-l-emerald-400 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Empirical Validation & Uncertainty Bounds
            </h3>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-[var(--text-secondary)] font-mono">
              <p>
                <strong className="text-[var(--text-primary)]">Median Absolute Percentage Error (MdAPE):</strong>
                <br />
                Australia (4.9%) and the United States (6.8%) achieve exceptional calibration fidelity across all seasons.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">Confidence Intervals (p25 – p75):</strong>
                <br />
                For every grid cell, uncertainty bounds are calculated using the 25th and 75th percentiles of the empirical ratio distributions.
                Exported CSV files and tooltips include these lower and upper confidence bounds.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">Zero Double Counting:</strong>
                <br />
                VIIRS NOAA-20 observations (2018–2025) operate strictly as independent validation checks and are never summed into Suomi-NPP counts.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs font-mono text-emerald-400 flex items-center gap-2">
            <Award className="w-4 h-4" /> NASA Space Apps Challenge 2026 Calibrated Standard
          </div>
        </div>

        {/* Known Limitations Card (Honest Disclosure) */}
        <div className="glass-panel p-6 border-l-4 border-l-[var(--viirs)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--viirs)]" />
              Known Limitations & Disclaimers
            </h3>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-[var(--text-secondary)] font-mono">
              <p>
                <strong className="text-amber-300">Canada Winter Uncertainty (16.1% MdAPE):</strong>
                <br />
                Winter months in high-latitude boreal regions have low solar angles, frequent heavy cloud cover, and seasonal snow cover.
                Hotspot detection frequencies are sparse, resulting in wider confidence intervals in Canadian winter months.
              </p>
              <p>
                <strong className="text-amber-300">FRP Non-Harmonization:</strong>
                <br />
                Fire Radiative Power (FRP) is an instantaneous energetic measurement dependent on pixel saturation thresholds.
                FRP values are summed as raw measurements and are <em>not</em> directly interchangeable across sensor platforms.
              </p>
              <p>
                <strong className="text-amber-300">Partial Coverage (2000 – July 2002):</strong>
                <br />
                Prior to Aqua's commissioning in July 2002, only the Terra satellite was active. These early months are explicitly flagged as partial.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs font-mono text-[var(--text-muted)]">
            ⚠️ Intended for macro-scale trends, not emergency 911 dispatch
          </div>
        </div>
      </div>

      {/* Citations & NASA FIRMS Credits */}
      <div className="mt-8 glass-panel p-6">
        <h3 className="text-base font-bold text-[var(--text-primary)] font-display flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-[var(--modis)]" />
          Data Provenance & Scientific Attribution
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">
          We acknowledge the use of data and imagery from the Fire Information for Resource Management System (FIRMS)
          operated by the NASA Earth Science Data Systems (ESDS) program. MODIS collection 6.1 (Terra MOD14 / Aqua MYD14)
          and VIIRS 375 m Active Fire product (VNP14IMG / VJ114IMG) provided by the NASA Land, Atmosphere Near real-time
          Capability for EOS (LANCE).
        </p>

        <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-4">
            <span>NASA Space Apps Challenge 2026</span>
            <span>•</span>
            <span>FastAPI + Supabase + React</span>
            <span>•</span>
            <span>1,424,490 Gridded Observations</span>
          </div>
          <a
            href="https://firms.modaps.eosdis.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--modis)] hover:underline flex items-center gap-1"
          >
            NASA FIRMS Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
