import { useMemo } from 'react';
import { useAnomaly } from '../hooks/useFireData';
import { useStore } from '../store/useStore';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export function AnomalyChart() {
  const { data, isLoading } = useAnomaly();
  const { selectedMonth, setSelectedMonth } = useStore();

  const anomalyPoints = useMemo(() => {
    return data?.data || [];
  }, [data]);

  // Max absolute anomaly for symmetric Y scale
  const maxAbsAnomaly = useMemo(() => {
    if (anomalyPoints.length === 0) return 100;
    return Math.max(...anomalyPoints.map((p) => Math.abs(p.anomaly)), 100);
  }, [anomalyPoints]);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center text-xs font-mono text-[var(--text-muted)] animate-pulse">
        Computing leave-one-out historical medians & anomalies...
      </div>
    );
  }

  // Active selected anomaly point
  const activePoint = anomalyPoints.find((p) => p.month === selectedMonth) || anomalyPoints[anomalyPoints.length - 1];

  return (
    <div className="glass-panel p-5">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <h4 className="text-base font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--modis)]" />
            Historical Fire Anomaly (Leave-One-Out Median Baseline)
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Evaluates whether fire activity was significantly above (+orange) or below (-blue) the historical norm for each calendar month.
          </p>
        </div>

        {activePoint && (
          <div className="flex items-center gap-3 bg-[var(--bg-deep)] px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-mono">
            <span className="text-[var(--text-muted)]">{activePoint.month}:</span>
            <span
              className={`font-bold flex items-center gap-1 ${
                activePoint.anomaly >= 0 ? 'text-[var(--viirs)]' : 'text-sky-400'
              }`}
            >
              {activePoint.anomaly >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {activePoint.anomaly >= 0 ? `+${activePoint.anomaly_pct}%` : `${activePoint.anomaly_pct}%`}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              (Obs: {Math.round(activePoint.harm).toLocaleString()} | Median: {Math.round(activePoint.median).toLocaleString()})
            </span>
          </div>
        )}
      </div>

      {/* Anomaly Bar Sparkline / Waterfall */}
      <div className="mt-6">
        <div className="h-44 w-full flex items-center gap-1 relative overflow-x-auto pb-2">
          {/* Zero baseline rule */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border)] pointer-events-none" />

          {anomalyPoints.map((pt) => {
            const isPositive = pt.anomaly >= 0;
            const barHeightPct = Math.min((Math.abs(pt.anomaly) / maxAbsAnomaly) * 45, 48);
            const isSelected = selectedMonth === pt.month;

            return (
              <div
                key={pt.month}
                onClick={() => setSelectedMonth(pt.month)}
                className="flex-1 min-w-[5px] h-full flex flex-col justify-center items-center group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[var(--bg-deep)] border border-[var(--border)] px-2 py-0.5 rounded text-[10px] font-mono pointer-events-none whitespace-nowrap z-30 shadow-lg">
                  <span className="text-[var(--text-primary)] font-bold">{pt.month}: </span>
                  <span className={isPositive ? 'text-[var(--viirs)]' : 'text-sky-400'}>
                    {isPositive ? `+${pt.anomaly_pct}%` : `${pt.anomaly_pct}%`}
                  </span>
                </div>

                {/* Bar representation */}
                <div className="w-full h-full flex flex-col justify-center items-center">
                  {isPositive ? (
                    <>
                      {/* Positive Top Half */}
                      <div className="w-full h-1/2 flex items-end">
                        <div
                          style={{ height: `${Math.max(barHeightPct, 6)}%` }}
                          className={`w-full rounded-t transition-all ${
                            isSelected
                              ? 'bg-amber-300 shadow-[0_0_8px_#fde047]'
                              : 'bg-gradient-to-t from-orange-600 to-[var(--viirs)] opacity-80 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                      <div className="w-full h-1/2" />
                    </>
                  ) : (
                    <>
                      {/* Negative Bottom Half */}
                      <div className="w-full h-1/2" />
                      <div className="w-full h-1/2 flex items-start">
                        <div
                          style={{ height: `${Math.max(barHeightPct, 6)}%` }}
                          className={`w-full rounded-b transition-all ${
                            isSelected
                              ? 'bg-sky-300 shadow-[0_0_8px_#7dd3fc]'
                              : 'bg-gradient-to-b from-blue-600 to-sky-400 opacity-80 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mt-3 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[var(--viirs)]" /> Above Historical Median (Severe Season)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-400" /> Below Historical Median (Quiet Season)
            </span>
          </div>
          <span className="text-[11px]">Click any bar to synchronize map & timeline</span>
        </div>
      </div>
    </div>
  );
}
