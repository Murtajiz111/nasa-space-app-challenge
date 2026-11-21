import { useEffect, useRef, useState } from 'react';
import { Map, NavigationControl, ScaleControl, type StyleSpecification, type IControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, ColumnLayer } from '@deck.gl/layers';
import { useStore } from '../store/useStore';
import { useCells } from '../hooks/useFireData';
import { COUNTRIES } from './CountrySelector';
import { PRESETS } from '../lib/constants';
import { Flame, Layers, Compass, Satellite } from 'lucide-react';
import type { GridCell } from '../lib/api';

// Free Basemap Styles (Zero API key required, zero watermarks)
const BASEMAP_STYLES: Record<string, StyleSpecification | string> = {
  'esri-dark': {
    version: 8,
    sources: {
      'esri-dark': {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Esri, HERE, Garmin, © OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'esri-dark-tiles',
        type: 'raster',
        source: 'esri-dark',
        minzoom: 0,
        maxzoom: 16,
      },
    ],
  },
  'nasa-gibs': {
    version: 8,
    sources: {
      'nasa-night': {
        type: 'raster',
        tiles: [
          'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-04-18/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
        ],
        tileSize: 256,
        attribution: 'NASA Earth Science Data Systems / GIBS / EOSDIS',
      },
    },
    layers: [
      {
        id: 'nasa-night-tiles',
        type: 'raster',
        source: 'nasa-night',
        minzoom: 0,
        maxzoom: 8,
      },
    ],
  },
  'openfreemap': 'https://tiles.openfreemap.org/styles/dark',
};



export function MapViewer() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  const { country, sensorView, basemap, setBasemap, selectedMonth } = useStore();
  const { data: cellsData, isLoading: cellsLoading } = useCells();

  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    cell: GridCell;
  } | null>(null);

  const [use3dColumns, setUse3dColumns] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCountry = COUNTRIES.find((c) => c.id === country) || COUNTRIES[0];
    const initialStyle = BASEMAP_STYLES[basemap] || BASEMAP_STYLES['esri-dark'];

    const map = new Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: initialCountry.center,
      zoom: initialCountry.zoom,
      attributionControl: false,
      pitch: 0,
    });

    map.addControl(new NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

    const overlay = new MapboxOverlay({
      layers: [],
    });
    map.addControl(overlay as unknown as IControl);

    mapRef.current = map;
    overlayRef.current = overlay;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  // Update style when basemap changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const nextStyle = BASEMAP_STYLES[basemap] || BASEMAP_STYLES['esri-dark'];
    map.setStyle(nextStyle);
  }, [basemap]);

  // Fly to country center when country changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = COUNTRIES.find((c) => c.id === country);
    if (target) {
      map.flyTo({
        center: target.center,
        zoom: target.zoom,
        pitch: use3dColumns ? 45 : 0,
        duration: 1800,
        essential: true,
      });
    }
  }, [country, use3dColumns]);

  // Update deck.gl layers when cellsData or settings change
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const rawCells = cellsData?.cells || [];

    // Filter by sensor if requested
    const filteredCells = rawCells.filter((c) => {
      if (sensorView === 'modis') return c.sensor === 'MODIS';
      if (sensorView === 'viirs') return c.sensor === 'VIIRS_SNPP';
      return true; // harmonized shows all
    });

    // Max harm for color scaling
    const maxHarm = filteredCells.reduce((max, c) => Math.max(max, c.harm), 1);

    // Color ramp: Inferno-inspired [R, G, B, A]
    const getColor = (harm: number): [number, number, number, number] => {
      const t = Math.min(Math.max(harm / maxHarm, 0.05), 1);
      if (t < 0.25) {
        return [60 + t * 400, 15 + t * 80, 110 - t * 100, 210];
      }
      if (t < 0.6) {
        return [180 + (t - 0.25) * 150, 40 + (t - 0.25) * 180, 20, 225];
      }
      return [255, 160 + (t - 0.6) * 200, 20 + (t - 0.6) * 120, 245];
    };

    let layer;

    if (use3dColumns) {
      layer = new ColumnLayer({
        id: 'hotspot-columns-layer',
        data: filteredCells,
        diskResolution: 12,
        radius: 12000,
        extruded: true,
        pickable: true,
        elevationScale: 50,
        getPosition: (d: GridCell) => [d.lon_c, d.lat_c],
        getFillColor: (d: GridCell) => getColor(d.harm),
        getElevation: (d: GridCell) => Math.sqrt(d.harm) * 120,
        onHover: (info) => {
          if (info.object && info.x && info.y) {
            setHoveredCell({ x: info.x, y: info.y, cell: info.object as GridCell });
          } else {
            setHoveredCell(null);
          }
        },
      });
    } else {
      layer = new ScatterplotLayer({
        id: 'hotspot-scatter-layer',
        data: filteredCells,
        pickable: true,
        opacity: 0.85,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 4,
        radiusMaxPixels: 35,
        lineWidthMinPixels: 1,
        getPosition: (d: GridCell) => [d.lon_c, d.lat_c],
        getRadius: (d: GridCell) => Math.max(Math.sqrt(d.harm) * 4500, 7000),
        getFillColor: (d: GridCell) => getColor(d.harm),
        getLineColor: (d: GridCell) => [255, 255, 255, d.partial ? 180 : 50],
        onHover: (info) => {
          if (info.object && info.x && info.y) {
            setHoveredCell({ x: info.x, y: info.y, cell: info.object as GridCell });
          } else {
            setHoveredCell(null);
          }
        },
      });
    }

    overlay.setProps({
      layers: [layer],
    });
  }, [cellsData, use3dColumns, sensorView]);

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-[var(--border)] shadow-[0_0_30px_rgba(5,7,13,0.8)]">
      {/* MapLibre DOM container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Controls HUD Top-Left */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-md">
        {/* Layer, Basemap & Mode Toolbar */}
        <div className="glass-panel p-2.5 flex items-center gap-2 text-xs font-mono flex-wrap">
          <button
            type="button"
            onClick={() => {
              const next3d = !use3dColumns;
              setUse3dColumns(next3d);
              if (mapRef.current) {
                mapRef.current.easeTo({ pitch: next3d ? 50 : 0, duration: 800 });
              }
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              use3dColumns ? 'bg-[var(--modis)] text-black font-semibold' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {use3dColumns ? '3D Extrusion' : '2D Hotspots'}
          </button>

          <span className="text-[var(--border)]">|</span>

          {/* Basemap Switcher */}
          <div className="flex items-center gap-1">
            <Satellite className="w-3.5 h-3.5 text-[var(--viirs)]" />
            <select
              value={basemap}
              onChange={(e) => setBasemap(e.target.value as any)}
              className="bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] rounded px-1.5 py-0.5 text-xs outline-none cursor-pointer"
            >
              <option value="esri-dark">ESRI Dark Canvas</option>
              <option value="nasa-gibs">NASA GIBS Night Lights</option>
              <option value="openfreemap">OpenFreeMap Dark</option>
            </select>
          </div>

          <span className="text-[var(--border)]">|</span>

          {/* Active cells counter */}
          <span className="text-[var(--text-muted)]">
            {cellsLoading ? (
              <span className="text-[var(--viirs)] animate-pulse">Loading cells...</span>
            ) : (
              <span className="text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)] font-bold font-mono">
                  {cellsData?.cells.length.toLocaleString() ?? 0}
                </strong>{' '}
                cells ({selectedMonth})
              </span>
            )}
          </span>
        </div>

        {/* Historical Event Presets */}
        <div className="glass-panel p-2.5 text-xs font-mono flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <Compass className="w-3 h-3 text-[var(--modis)]" /> Historical Benchmark Crises:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  useStore.getState().setCountry(preset.country);
                  useStore.getState().setSelectedMonth(preset.month);
                  if (mapRef.current) {
                    mapRef.current.flyTo({
                      center: preset.center,
                      zoom: preset.zoom,
                      pitch: use3dColumns ? 45 : 0,
                      duration: 1600,
                    });
                  }
                }}
                className="px-2 py-1 rounded bg-[rgba(11,24,55,0.6)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border)] text-[11px] transition-colors cursor-pointer"
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Tooltip HUD */}
      {hoveredCell && (
        <div
          className="absolute z-30 pointer-events-none glass-panel p-3 text-xs font-mono shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-[var(--modis)]"
          style={{
            left: hoveredCell.x + 15,
            top: hoveredCell.y - 15,
            transform: 'translate(0, -50%)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-[var(--border)]">
            <Flame className="w-3.5 h-3.5 text-[var(--viirs)]" />
            <span className="font-bold text-[var(--text-primary)]">
              {hoveredCell.cell.lat_c.toFixed(3)}°N, {hoveredCell.cell.lon_c.toFixed(3)}°E
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Harmonized Hotspots:</span>
              <span className="font-bold text-[var(--viirs)]">
                {hoveredCell.cell.harm.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-[10px]">
              <span className="text-[var(--text-muted)]">Uncertainty [p25–p75]:</span>
              <span className="text-[var(--text-secondary)]">
                [{hoveredCell.cell.harm_lo} – {hoveredCell.cell.harm_hi}]
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">FRP Sum (MW):</span>
              <span className="text-amber-300">
                {hoveredCell.cell.frp_sum.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Primary Sensor:</span>
              <span className={hoveredCell.cell.sensor === 'MODIS' ? 'text-[var(--modis)]' : 'text-[var(--viirs)]'}>
                {hoveredCell.cell.sensor}
              </span>
            </div>
            {hoveredCell.cell.partial && (
              <div className="text-[10px] text-amber-400 bg-[rgba(255,176,0,0.15)] px-1.5 py-0.5 rounded mt-1">
                ⚠️ Partial Month (Pre-Aqua July 2002)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend Bottom-Right */}
      <div className="absolute bottom-4 right-4 z-20 glass-panel p-3 text-xs font-mono flex flex-col gap-1.5">
        <span className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
          0.25° Fire Hotspot Density
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)]">Low</span>
          <div
            className="w-28 h-2.5 rounded"
            style={{
              background: 'linear-gradient(to right, rgb(60,15,110), rgb(180,40,20), rgb(255,180,20))',
            }}
          />
          <span className="text-[10px] text-[var(--text-muted)]">Peak</span>
        </div>
        <span className="text-[9px] text-[var(--text-muted)]">
          Height = √Harmonized Hotspots
        </span>
      </div>
    </div>
  );
}
