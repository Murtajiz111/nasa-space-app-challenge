import { useHealth } from '../hooks/useFireData';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Flame, Activity, Download, Eye, EyeOff, Satellite, ShieldCheck, Database } from 'lucide-react';

export function Navbar() {
  const { data: healthData, isError } = useHealth();
  const { country, yearStart, yearEnd, includePartial, setIncludePartial, bounds } = useStore();

  const handleDownloadCsv = () => {
    const url = api.exportCsvUrl(country, yearStart, yearEnd, includePartial, bounds);
    window.open(url, '_blank');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[rgba(5,7,13,0.85)] border-b border-[var(--border)] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Brand & Mission Tag */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--modis)] to-[var(--viirs)] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(78,168,255,0.4)]">
          <div className="w-full h-full bg-[var(--bg-deep)] rounded-[7px] flex items-center justify-center">
            <Flame className="w-5 h-5 text-[var(--viirs)]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-sm font-display text-[var(--text-primary)]">
              HARMONIZED BURN CALENDAR
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[rgba(78,168,255,0.15)] text-[var(--modis)] border border-[rgba(78,168,255,0.3)]">
              NASA SPACE APPS
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-2">
            <span>MODIS 1km + VIIRS 375m</span>
            <span>•</span>
            <span>2000–2025 (25 Years)</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
        <a href="#problem" className="hover:text-[var(--text-primary)] transition-colors">The Gap</a>
        <a href="#solution" className="hover:text-[var(--text-primary)] transition-colors">Calibration</a>
        <a href="#explorer" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
          <Satellite className="w-3.5 h-3.5 text-[var(--modis)]" /> Explorer
        </a>
        <a href="#calendar" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-[var(--viirs)]" /> Burn Calendar
        </a>
        <a href="#reliability" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Reliability
        </a>
      </nav>

      {/* System Status & Actions */}
      <div className="flex items-center gap-3">
        {/* Database Telemetry Indicator */}
        <div
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-xs font-mono"
          title={isError ? "Database Unreachable" : `Connected to Supabase PostgreSQL: ${healthData?.row_count?.toLocaleString() ?? '1,424,490'} cells`}
        >
          <span className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500 animate-ping' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'}`} />
          <Database className="w-3 h-3 text-[var(--text-muted)]" />
          <span className="text-[var(--text-secondary)]">
            {healthData?.row_count ? `${(healthData.row_count / 1_000_000).toFixed(2)}M cells` : 'Supabase Active'}
          </span>
        </div>

        {/* Toggle Partial Months */}
        <button
          type="button"
          onClick={() => setIncludePartial(!includePartial)}
          title="Toggle pre-Aqua July 2002 partial observations"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer border transition-colors ${
            includePartial
              ? 'bg-[rgba(255,176,0,0.15)] text-[var(--viirs)] border-[var(--viirs)]'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-secondary)]'
          }`}
        >
          {includePartial ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Partial 2000–02</span>
        </button>

        {/* Export CSV button */}
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-gradient-to-r from-[var(--modis)] to-[#2563eb] text-white font-medium flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_12px_rgba(78,168,255,0.3)] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
    </header>
  );
}
