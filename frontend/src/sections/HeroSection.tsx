import { useEffect, useRef } from 'react';
import { useSummary, useMeta } from '../hooks/useFireData';
import { KPICard } from '../components/KPICard';
import { Flame, Satellite, Compass, ArrowDown, Activity, Sparkles } from 'lucide-react';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data: summaryData } = useSummary();
  const { data: metaData } = useMeta();

  // Calculate combined total across all 3 countries
  const totalHarmonized = summaryData?.kpis.reduce((acc, k) => acc + k.total_harm, 0) ?? 10070040;
  const totalCells = metaData?.total_rows ?? 1424490;

  // Canvas 3D globe animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    // Fire hotspot particles on the globe
    const hotspots = [
      // Australia coordinates (approx normalized)
      { lat: -25, lon: 135, intensity: 1.0 },
      { lat: -32, lon: 148, intensity: 0.9 },
      { lat: -18, lon: 125, intensity: 0.8 },
      { lat: -12, lon: 132, intensity: 0.85 },
      // North America
      { lat: 55, lon: -115, intensity: 0.95 }, // Canada boreal
      { lat: 60, lon: -125, intensity: 0.8 },
      { lat: 38, lon: -120, intensity: 0.9 },  // California
      { lat: 45, lon: -118, intensity: 0.75 },
      { lat: 33, lon: -110, intensity: 0.7 },
      // Tropical/Equatorial hotspots
      { lat: -5, lon: -60, intensity: 0.7 },
      { lat: -10, lon: 25, intensity: 0.65 },
      { lat: 15, lon: 100, intensity: 0.6 },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      rotation += 0.0035;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // Deep space background gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.6);
      bgGrad.addColorStop(0, 'rgba(11, 24, 55, 0.45)');
      bgGrad.addColorStop(0.7, 'rgba(5, 7, 13, 0.2)');
      bgGrad.addColorStop(1, 'rgba(5, 7, 13, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Globe outer atmosphere glow
      const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.15);
      atmoGrad.addColorStop(0, 'rgba(78, 168, 255, 0.2)');
      atmoGrad.addColorStop(0.5, 'rgba(78, 168, 255, 0.08)');
      atmoGrad.addColorStop(1, 'rgba(78, 168, 255, 0)');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Globe sphere surface
      const globeGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      globeGrad.addColorStop(0, '#101c3d');
      globeGrad.addColorStop(0.65, '#070c1e');
      globeGrad.addColorStop(1, '#02050b');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(78, 168, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw latitude parallels
      ctx.strokeStyle = 'rgba(78, 168, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const phi = (lat * Math.PI) / 180;
        const y = cy - radius * Math.sin(phi);
        const rParallel = radius * Math.cos(phi);
        ctx.beginPath();
        ctx.ellipse(cx, y, rParallel, rParallel * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw longitude meridians (rotating)
      for (let lon = 0; lon < 360; lon += 45) {
        const theta = ((lon * Math.PI) / 180) + rotation;
        const cosTheta = Math.cos(theta);
        if (cosTheta > -0.2) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.abs(cosTheta) * radius, radius, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(78, 168, 255, ${0.05 + Math.max(0, cosTheta) * 0.12})`;
          ctx.stroke();
        }
      }

      // Orbiting Satellite Track (Terra / SNPP Sun-Synchronous Polar Orbit)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.25, radius * 0.45, -Math.PI / 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 176, 0, 0.25)';
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();

      // Satellite marker on orbit
      const satT = rotation * 1.8;
      const satAngle = -Math.PI / 6;
      const satX0 = radius * 1.25 * Math.cos(satT);
      const satY0 = radius * 0.45 * Math.sin(satT);
      const satX = cx + satX0 * Math.cos(satAngle) - satY0 * Math.sin(satAngle);
      const satY = cy + satX0 * Math.sin(satAngle) + satY0 * Math.cos(satAngle);

      ctx.fillStyle = '#FFB000';
      ctx.beginPath();
      ctx.arc(satX, satY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 176, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(satX, satY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Render fire hotspots projected on rotating globe
      hotspots.forEach((h, idx) => {
        const lonRad = ((h.lon * Math.PI) / 180) + rotation;
        const latRad = (h.lat * Math.PI) / 180;

        // 3D coordinates on unit sphere
        const x3 = Math.cos(latRad) * Math.sin(lonRad);
        const y3 = -Math.sin(latRad);
        const z3 = Math.cos(latRad) * Math.cos(lonRad);

        // Visible only on forward hemisphere
        if (z3 > 0.05) {
          const px = cx + x3 * radius;
          const py = cy + y3 * radius;
          const pulse = Math.sin(Date.now() * 0.004 + idx) * 0.3 + 0.7;
          const baseSize = 4 * h.intensity * (0.6 + z3 * 0.4) * pulse;

          // Glowing hotspot aura
          const hGrad = ctx.createRadialGradient(px, py, 0, px, py, baseSize * 3);
          hGrad.addColorStop(0, 'rgba(255, 230, 80, 0.95)');
          hGrad.addColorStop(0.3, 'rgba(255, 120, 0, 0.75)');
          hGrad.addColorStop(0.7, 'rgba(220, 30, 0, 0.3)');
          hGrad.addColorStop(1, 'rgba(220, 30, 0, 0)');

          ctx.fillStyle = hGrad;
          ctx.beginPath();
          ctx.arc(px, py, baseSize * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4 py-16">
      {/* Background Starfield and Canvas 3D Globe */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full max-w-[850px] aspect-square opacity-70"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Mission Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(78,168,255,0.1)] border border-[rgba(78,168,255,0.3)] mb-6 shadow-[0_0_20px_rgba(78,168,255,0.2)]">
          <Satellite className="w-4 h-4 text-[var(--modis)]" />
          <span className="text-xs font-mono font-medium tracking-wider text-[var(--text-primary)]">
            NASA FIRMS EARTH OBSERVATION HARMONIZATION
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--viirs)] animate-ping" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] font-display leading-[1.08] max-w-4xl">
          Twenty-five years of fire. <br />
          <span className="bg-gradient-to-r from-[var(--modis)] via-[#93c5fd] to-[var(--viirs)] bg-clip-text text-transparent">
            One consistent record.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl font-light leading-relaxed">
          Bridging the gap between 1km MODIS (2000–2025) and 375m VIIRS (2012–2025) observations.
          Continuous, calibrated fire analytics across Australia, Canada, and the United States.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
          <a
            href="#explorer"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--modis)] to-[#2563eb] text-white font-medium text-sm font-mono flex items-center gap-2 shadow-[0_0_25px_rgba(78,168,255,0.45)] hover:shadow-[0_0_35px_rgba(78,168,255,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Launch Interactive Explorer
          </a>
          <a
            href="#calendar"
            className="px-6 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm font-mono flex items-center gap-2 hover:bg-[var(--bg-hover)] hover:border-[var(--modis)] active:scale-95 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[var(--viirs)]" />
            View 25-Year Burn Calendar
          </a>
        </div>

        {/* Live KPI Grid */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <KPICard
            label="Harmonized Hotspots"
            value={totalHarmonized}
            subtitle="MODIS-calibrated hotspot baseline"
            color="var(--viirs)"
            icon={<Flame className="w-3.5 h-3.5 text-[var(--viirs)]" />}
            badge="2000–2025"
          />
          <KPICard
            label="0.25° Grid Cells"
            value={totalCells}
            subtitle="Indexed monthly observation cells"
            color="var(--modis)"
            icon={<Satellite className="w-3.5 h-3.5 text-[var(--modis)]" />}
            badge="Supabase"
          />
          <KPICard
            label="Harmonization MdAPE"
            value="4.9% – 6.8%"
            subtitle="Median absolute error (AU & US)"
            color="#34d399"
            icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            badge="Validated"
          />
          <KPICard
            label="Continuous Baseline"
            value="300"
            unit="months"
            subtitle="25 full years without sensor rupture"
            color="#a78bfa"
            icon={<Activity className="w-3.5 h-3.5 text-purple-400" />}
            badge="Terra/Aqua/SNPP"
          />
        </div>

        {/* Scroll down indicator */}
        <a
          href="#problem"
          className="mt-12 flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-[var(--modis)] transition-colors text-xs font-mono group"
        >
          <span>UNDERSTAND THE SENSOR GAP</span>
          <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}
