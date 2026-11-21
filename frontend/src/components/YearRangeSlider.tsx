import { useStore } from '../store/useStore';
import { Calendar, RefreshCw } from 'lucide-react';

export function YearRangeSlider() {
  const { yearStart, yearEnd, setYearRange } = useStore();

  const resetAllYears = () => {
    setYearRange(2000, 2025);
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[var(--text-muted)] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[var(--viirs)]" /> Temporal Window:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-primary)] font-semibold">
            {yearStart} – {yearEnd} ({yearEnd - yearStart + 1} yrs)
          </span>
          {(yearStart !== 2000 || yearEnd !== 2025) && (
            <button
              onClick={resetAllYears}
              title="Reset to 2000–2025"
              className="text-[var(--text-muted)] hover:text-[var(--modis)] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-[var(--modis)] min-w-[36px]">{yearStart}</span>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={2000}
            max={2025}
            value={yearStart}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val <= yearEnd) setYearRange(val, yearEnd);
            }}
            className="w-full accent-[var(--modis)] cursor-pointer h-1.5 bg-[var(--bg-deep)] rounded-lg appearance-none"
          />
          <input
            type="range"
            min={2000}
            max={2025}
            value={yearEnd}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= yearStart) setYearRange(yearStart, val);
            }}
            className="w-full accent-[var(--viirs)] cursor-pointer h-1.5 bg-[var(--bg-deep)] rounded-lg appearance-none ml-2"
          />
        </div>
        <span className="text-xs font-mono text-[var(--viirs)] min-w-[36px] text-right">{yearEnd}</span>
      </div>
    </div>
  );
}
