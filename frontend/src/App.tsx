import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { HeroSection } from './sections/HeroSection';
import { ProblemSection } from './sections/ProblemSection';
import { SolutionSection } from './sections/SolutionSection';
import { ExplorerSection } from './sections/ExplorerSection';
import { BurnCalendarSection } from './sections/BurnCalendarSection';
import { ReliabilitySection } from './sections/ReliabilitySection';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] font-body flex flex-col selection:bg-[var(--modis)] selection:text-black">
        {/* Mission Telemetry Topbar */}
        <Navbar />

        {/* Core Mission Journey Sections */}
        <main className="flex-1">
          {/* A. Hero: 3D Earth, 25-Year Headline, Live Counters */}
          <HeroSection />

          {/* B. The Problem: Sensor Transition & The 2012 Gap */}
          <ProblemSection />

          {/* C. The Solution: Empirical Calibration & Validation Gauges */}
          <SolutionSection />

          {/* D. Interactive Explorer: MapLibre + deck.gl 0.25° Hotspots, Timeline Scrubbing */}
          <ExplorerSection />

          {/* E. Burn Calendar: Concentric Radial Wheel & Heatmap Matrix */}
          <BurnCalendarSection />

          {/* F. Reliability: Scientific Citations, Uncertainty, NASA FIRMS Attribution */}
          <ReliabilitySection />
        </main>

        {/* Mission Footer */}
        <footer className="border-t border-[var(--border)] bg-[#04060a] py-12 px-4 text-xs font-mono text-[var(--text-muted)]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-[var(--text-primary)] font-bold text-sm tracking-wider font-display">
                MODIS + VIIRS HARMONIZED BURN CALENDAR
              </div>
              <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                NASA Space Apps Challenge 2026 • Earth Science Division
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a href="#hero" className="hover:text-[var(--text-primary)] transition-colors">Mission Top</a>
              <a href="#explorer" className="hover:text-[var(--text-primary)] transition-colors">Explorer</a>
              <a href="#calendar" className="hover:text-[var(--text-primary)] transition-colors">Calendar</a>
              <a href="#reliability" className="hover:text-[var(--text-primary)] transition-colors">Methodology</a>
            </div>

            <div className="text-right">
              <span className="text-[var(--modis)]">Terra (10:30) • Aqua (13:30) • SNPP (13:30)</span>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                FastAPI • PostgreSQL / Supabase • React 19 • MapLibre GL • deck.gl
              </div>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
