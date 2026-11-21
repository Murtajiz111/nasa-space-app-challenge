import React, { useEffect, useState } from 'react';

interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: string;
}

function formatNumber(n: number): string {
  if (isNaN(n)) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return Math.round(n).toLocaleString();
}

export function KPICard({ label, value, unit, color = 'var(--modis)', icon, subtitle, badge }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }
    let startTime: number;
    const duration = 900;
    const startVal = 0;
    const endVal = value;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const factor = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(startVal + (endVal - startVal) * factor);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  const renderedNum = typeof displayValue === 'number' ? formatNumber(displayValue) : displayValue;

  return (
    <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[var(--modis)] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[rgba(255,176,0,0.15)] text-[var(--viirs)] border border-[rgba(255,176,0,0.3)]">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span className="text-2xl font-bold font-mono tracking-tight" style={{ color }}>
          {renderedNum}
        </span>
        {unit && <span className="text-xs font-mono text-[var(--text-secondary)]">{unit}</span>}
      </div>

      {subtitle && <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">{subtitle}</p>}

      {/* Decorative NASA HUD corner tick */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--border)] group-hover:border-[var(--modis)] transition-colors pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--border)] group-hover:border-[var(--modis)] transition-colors pointer-events-none" />
    </div>
  );
}
