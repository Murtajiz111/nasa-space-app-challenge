import { create } from 'zustand';

export type Country = 'Australia' | 'Canada' | 'United States';

export const DEFAULT_PEAK_MONTHS: Record<Country, string> = {
  'Australia': '2020-01',
  'Canada': '2023-07',
  'United States': '2020-09',
};

interface AppState {
  // Filters
  country: Country;
  yearStart: number;
  yearEnd: number;
  selectedMonth: string; // YYYY-MM
  includePartial: boolean;

  // Bounds
  bounds: {
    min_lat?: number;
    max_lat?: number;
    min_lon?: number;
    max_lon?: number;
  };

  // UI state
  sensorView: 'harmonized' | 'modis' | 'viirs';
  calendarMode: 'radial' | 'heatmap';
  basemap: 'esri-dark' | 'nasa-gibs' | 'openfreemap';

  // Actions
  setCountry: (c: Country) => void;
  setYearRange: (start: number, end: number) => void;
  setSelectedMonth: (m: string) => void;
  setIncludePartial: (v: boolean) => void;
  setBounds: (b: AppState['bounds']) => void;
  clearBounds: () => void;
  setSensorView: (v: AppState['sensorView']) => void;
  setCalendarMode: (v: AppState['calendarMode']) => void;
  setBasemap: (b: AppState['basemap']) => void;
}

export const useStore = create<AppState>((set) => ({
  country: 'Australia',
  yearStart: 2000,
  yearEnd: 2025,
  selectedMonth: '2020-01',
  includePartial: false,
  bounds: {},
  sensorView: 'harmonized',
  calendarMode: 'heatmap',
  basemap: 'esri-dark',

  setCountry: (country) => set({ country, selectedMonth: DEFAULT_PEAK_MONTHS[country] }),
  setYearRange: (yearStart, yearEnd) => set({ yearStart, yearEnd }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setIncludePartial: (includePartial) => set({ includePartial }),
  setBounds: (bounds) => set({ bounds }),
  clearBounds: () => set({ bounds: {} }),
  setSensorView: (sensorView) => set({ sensorView }),
  setCalendarMode: (calendarMode) => set({ calendarMode }),
  setBasemap: (basemap) => set({ basemap }),
}));
