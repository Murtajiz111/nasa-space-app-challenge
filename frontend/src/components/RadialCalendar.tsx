import { useMemo, useState } from 'react';
import { useCalendar } from '../hooks/useFireData';
import { useStore } from '../store/useStore';
import type { CalendarCell } from '../lib/api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RadialCalendar() {
  const { data, isLoading } = useCalendar();
  const { selectedMonth, setSelectedMonth } = useStore();
  const [hoveredCell, setHoveredCell] = useState<{
    year: number;
    mon: number;
    harm: number;
    partial: boolean;
  } | null>(null);

  // Group cells by key
  const { cellMap, maxVal, years } = useMemo(() => {
    if (!data?.cells) return { cellMap: new Map<string, CalendarCell>(), maxVal: 1, years: [] as number[] };

    const map = new Map<string, CalendarCell>();
    let max = 1;
    const yearSet = new Set<number>();

    for (const c of data.cells) {
      map.set(`${c.year}-${c.mon}`, c);
      if (c.harm > max) max = c.harm;
      yearSet.add(c.year);
    }

    const sortedYears = Array.from(yearSet).sort((a, b) => a - b);
    return { cellMap: map, maxVal: max, years: sortedYears };
  }, [data]);

  // SVG Geometry
  const size = 640;
  const cx = size / 2;
  const cy = size / 2;
  const innerRadius = 80;
  const outerRadius = 280;
  const ringWidth = years.length > 0 ? (outerRadius - innerRadius) / years.length : 8;

  // Color mapping
  const getColor = (harm: number, isSelected: boolean) => {
    if (isSelected) return '#38bdf8';
    if (harm === 0) return 'rgba(15, 23, 42, 0.4)';
    const t = Math.min(harm / maxVal, 1);
    // Inferno-style gradient
    if (t < 0.25) return `rgba(${60 + t * 400}, ${15 + t * 80}, ${110 - t * 100}, 0.85)`;
    if (t < 0.6) return `rgba(${180 + (t - 0.25) * 150}, ${40 + (t - 0.25) * 180}, 20, 0.9)`;
    return `rgba(255, ${160 + (t - 0.6) * 180}, ${20 + (t - 0.6) * 100}, 0.95)`;
  };

  if (isLoading) {
    return (
      <div className="h-[450px] flex items-center justify-center text-sm font-mono text-[var(--text-muted)] animate-pulse">
        Generating 25-Year Concentric Fire Rings...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[580px] aspect-square overflow-visible"
      >
        {/* Deep background halo */}
        <circle cx={cx} cy={cy} r={outerRadius + 20} fill="none" stroke="rgba(78,168,255,0.06)" strokeWidth="1" />

        {/* 2012 Sensor Transition Ring Highlight */}
        {years.includes(2012) && (
          <circle
            cx={cx}
            cy={cy}
            r={innerRadius + (years.indexOf(2012) + 0.5) * ringWidth}
            fill="none"
            stroke="var(--viirs)"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            className="opacity-75"
          />
        )}

        {/* Radial Wedges for each Year x Month */}
        {years.map((year, yIdx) => {
          const r0 = innerRadius + yIdx * ringWidth;
          const r1 = r0 + ringWidth - 1;

          return Array.from({ length: 12 }, (_, mIdx) => {
            const mon = mIdx + 1;
            const cell = cellMap.get(`${year}-${mon}`);
            const harm = cell?.harm ?? 0;
            const isPartial = cell?.partial ?? false;
            const monthStr = `${year}-${String(mon).padStart(2, '0')}`;
            const isSelected = selectedMonth === monthStr;

            // Angles (Start at Top = -90 deg)
            const angleStep = (2 * Math.PI) / 12;
            const startAngle = mIdx * angleStep - Math.PI / 2 + 0.015;
            const endAngle = (mIdx + 1) * angleStep - Math.PI / 2 - 0.015;

            // Arc path coordinates
            const x1 = cx + r0 * Math.cos(startAngle);
            const y1 = cy + r0 * Math.sin(startAngle);
            const x2 = cx + r1 * Math.cos(startAngle);
            const y2 = cy + r1 * Math.sin(startAngle);
            const x3 = cx + r1 * Math.cos(endAngle);
            const y3 = cy + r1 * Math.sin(endAngle);
            const x4 = cx + r0 * Math.cos(endAngle);
            const y4 = cy + r0 * Math.sin(endAngle);

            const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${r1} ${r1} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r0} ${r0} 0 0 0 ${x1} ${y1} Z`;

            return (
              <path
                key={`${year}-${mon}`}
                d={pathData}
                fill={getColor(harm, isSelected)}
                stroke={isSelected ? '#ffffff' : (isPartial ? 'rgba(255,255,255,0.4)' : 'none')}
                strokeWidth={isSelected ? 1.5 : (isPartial ? 0.75 : 0)}
                strokeDasharray={isPartial && !isSelected ? '2 2' : 'none'}
                className="cursor-pointer transition-colors duration-150 hover:brightness-130"
                onClick={() => setSelectedMonth(monthStr)}
                onMouseEnter={() => setHoveredCell({ year, mon, harm, partial: isPartial })}
                onMouseLeave={() => setHoveredCell(null)}
              />
            );
          });
        })}

        {/* 12 Month Spoke Dividers & Text Labels */}
        {MONTH_NAMES.map((mName, mIdx) => {
          const angle = (mIdx * (2 * Math.PI)) / 12 - Math.PI / 2;
          const spokeX = cx + (outerRadius + 8) * Math.cos(angle);
          const spokeY = cy + (outerRadius + 8) * Math.sin(angle);
          const labelAngle = angle + (Math.PI / 12);
          const labelX = cx + (outerRadius + 22) * Math.cos(labelAngle);
          const labelY = cy + (outerRadius + 22) * Math.sin(labelAngle);

          return (
            <g key={mName}>
              <line
                x1={cx + (innerRadius - 4) * Math.cos(angle)}
                y1={cy + (innerRadius - 4) * Math.sin(angle)}
                x2={spokeX}
                y2={spokeY}
                stroke="rgba(78, 168, 255, 0.2)"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                className="text-[11px] font-mono font-medium"
              >
                {mName}
              </text>
            </g>
          );
        })}

        {/* Center Disc with Active Telemetry */}
        <circle cx={cx} cy={cy} r={innerRadius - 6} fill="#070c1a" stroke="rgba(78,168,255,0.3)" strokeWidth="1.5" />
        <text
          x={cx}
          y={cy - 16}
          textAnchor="middle"
          fill="var(--text-muted)"
          className="text-[10px] font-mono uppercase tracking-widest"
        >
          {hoveredCell ? `${hoveredCell.year}` : (selectedMonth ? selectedMonth.split('-')[0] : '2000–25')}
        </text>
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fill="var(--text-primary)"
          className="text-lg font-bold font-mono"
        >
          {hoveredCell ? MONTH_NAMES[hoveredCell.mon - 1] : (selectedMonth ? MONTH_NAMES[parseInt(selectedMonth.split('-')[1]) - 1] : 'RADIAL')}
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          fill="var(--viirs)"
          className="text-xs font-mono font-semibold"
        >
          {hoveredCell
            ? `${Math.round(hoveredCell.harm).toLocaleString()}`
            : (selectedMonth ? 'Synchronized' : 'Click Cell')}
        </text>
      </svg>

      {/* Radial Calendar Legend */}
      <div className="flex items-center gap-6 text-xs font-mono text-[var(--text-muted)] mt-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--viirs)]" /> Inner: 2000 → Outer: 2025
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-[var(--viirs)]" /> 2012 Sensor Breakpoint
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border border-dashed border-white" /> Partial Month
        </span>
      </div>
    </div>
  );
}
