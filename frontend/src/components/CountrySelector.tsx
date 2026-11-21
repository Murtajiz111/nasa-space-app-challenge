import { useStore, type Country } from '../store/useStore';
import { Globe } from 'lucide-react';

const COUNTRIES: { id: Country; label: string; emoji: string; center: [number, number]; zoom: number }[] = [
  { id: 'Australia', label: 'Australia', emoji: '🇦🇺', center: [133.7751, -25.2744], zoom: 3.5 },
  { id: 'Canada', label: 'Canada', emoji: '🇨🇦', center: [-96.8147, 56.1304], zoom: 3.2 },
  { id: 'United States', label: 'United States', emoji: '🇺🇸', center: [-98.5795, 39.8283], zoom: 3.5 },
];

export function CountrySelector() {
  const { country, setCountry } = useStore();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center gap-1 mr-1">
        <Globe className="w-3.5 h-3.5 text-[var(--modis)]" /> Target:
      </span>
      {COUNTRIES.map((c) => {
        const active = country === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setCountry(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              active
                ? 'bg-[rgba(78,168,255,0.18)] text-[var(--modis)] border border-[var(--modis)] shadow-[0_0_12px_rgba(78,168,255,0.25)]'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
export { COUNTRIES };
