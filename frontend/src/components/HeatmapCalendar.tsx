import React, { useMemo } from 'react';
import { useCalendar } from '../hooks/useFireData';
import { useStore } from '../store/useStore';
import type { CalendarCell } from '../lib/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getColor(value: number, max: number, isSelected: boolean): string {
  if (isSelected) return '#38bdf8';
  if (value === 0 || max === 0) return 'rgba(17, 24, 50, 0.4)';
  const t = Math.min(Math.max(value / max, 0.04), 1);
  // Inferno ramp
  if (t < 0.25) {
    return `rgba(${Math.round(40 + t * 400)}, ${Math.round(15 + t * 80)}, ${Math.round(110 - t * 100)}, 0.85)`;
  }
  if (t < 0.6) {
    return `rgba(${Math.round(180 + (t - 0.25) * 150)}, ${Math.round(40 + (t - 0.25) * 180)}, 20, 0.9)`;
  }
  return `rgba(255, ${Math.round(160 + (t - 0.6) * 180)}, ${Math.round(20 + (t - 0.6) * 100)}, 0.95)`;
}

export function HeatmapCalendar() {
  const { data, isLoading } = useCalendar();
  const { selectedMonth, setSelectedMonth } = useStore();

  const { matrix, maxVal, years } = useMemo(() => {
    if (!data?.cells) {
      return { matrix: new Map<string, CalendarCell>(), maxVal: 1, years: [] as number[] };
    }
    const m = new Map<string, CalendarCell>();
    let max = 1;
    const yrs = new Set<number>();
    for (const c of data.cells) {
      m.set(`${c.year}-${c.mon}`, c);
      if (c.harm > max) max = c.harm;
      yrs.add(c.year);
    }
    return { matrix: m, maxVal: max, years: Array.from(yrs).sort((a, b) => a - b) };
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs font-mono text-[var(--text-muted)] animate-pulse">
        Loading 25-Year Fire Activity Matrix...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[750px]">
        {/* Month Column Headers */}
        <div className="grid grid-cols-[64px_repeat(12,1fr)] gap-1 mb-1 pb-1 border-b border-[var(--border)]">
          <div className="text-xs font-mono text-[var(--text-muted)] text-right pr-2">YEAR</div>
          {MONTHS.map((m) => (
            <div key={m} className="text-center text-xs font-mono text-[var(--text-muted)] font-medium">
              {m}
            </div>
          ))}
        </div>

        {/* Year Rows */}
        <div className="space-y-1">
          {years.map((year) => {
            const isTransition = year === 2012;
            return (
              <React.Fragment key={year}>
                {/* 2012 Transition Separator Banner */}
                {isTransition && (
                  <div className="flex items-center gap-2 py-1 my-1 px-2 rounded bg-[rgba(255,176,0,0.12)] border border-[rgba(255,176,0,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--viirs)] animate-ping" />
                    <span className="text-[11px] font-mono text-[var(--viirs)] font-bold tracking-wider">
                      ▲ 2012 SENSOR BREAKPOINT: MODIS (Terra/Aqua) ➔ VIIRS (Suomi-NPP) Harmonization Active
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-[64px_repeat(12,1fr)] gap-1 items-center">
                  {/* Year Label */}
                  <div className="text-right pr-2 text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center justify-end gap-1">
                    {year}
                    {year < 2012 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--modis)] opacity-60" title="MODIS Era" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--viirs)] opacity-60" title="VIIRS Harmonized" />
                    )}
                  </div>

                  {/* 12 Month Cells */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mon) => {
                    const cell = matrix.get(`${year}-${mon}`);
                    const harm = cell?.harm ?? 0;
                    const monthStr = `${year}-${String(mon).padStart(2, '0')}`;
                    const isSelected = selectedMonth === monthStr;
                    const isPartial = cell?.partial ?? false;

                    return (
                      <div
                        key={`${year}-${mon}`}
                        onClick={() => setSelectedMonth(monthStr)}
                        title={`${MONTHS[mon - 1]} ${year}: ${Math.round(harm).toLocaleString()} harmonized hotspots [${cell?.harm_lo ?? 0} – ${cell?.harm_hi ?? 0}]${isPartial ? ' (Partial Month - Terra Only)' : ''}`}
                        className={`h-7 rounded flex items-center justify-center cursor-pointer transition-all relative group ${
                          isSelected
                            ? 'ring-2 ring-sky-300 scale-105 z-10 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                            : 'hover:scale-105 hover:z-10'
                        }`}
                        style={{
                          backgroundColor: getColor(harm, maxVal, isSelected),
                          border: isPartial
                            ? '1px dashed rgba(255,255,255,0.45)'
                            : isSelected
                            ? '1px solid #ffffff'
                            : '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {/* Text value on large cells if significant */}
                        {harm > maxVal * 0.4 && (
                          <span className="text-[9px] font-mono font-bold text-black opacity-80 pointer-events-none hidden sm:inline">
                            {harm >= 1000 ? `${(harm / 1000).toFixed(0)}k` : Math.round(harm)}
                          </span>
                        )}

                        {/* Partial icon marker */}
                        {isPartial && (
                          <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-amber-400 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[var(--text-muted)] mt-5 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span>Low</span>
            <div
              className="w-32 h-2.5 rounded"
              style={{
                background: 'linear-gradient(to right, rgb(40,15,110), rgb(180,40,20), rgb(255,180,20))',
              }}
            />
            <span>High Intensity</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border border-dashed border-white rounded-sm" /> Partial observation (pre-Aqua July 2002)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> Active selection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
