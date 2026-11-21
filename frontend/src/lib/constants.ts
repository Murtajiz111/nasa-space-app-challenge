import type { Country } from '../store/useStore';

export interface FirePreset {
  name: string;
  country: Country;
  month: string;
  center: [number, number];
  zoom: number;
  description: string;
}

export const PRESETS: FirePreset[] = [
  {
    name: 'AU: 2019–20 Black Summer',
    country: 'Australia',
    month: '2020-01',
    center: [149.5, -35.5],
    zoom: 5.5,
    description: 'Catastrophic mega-fires across New South Wales & Victoria.',
  },
  {
    name: 'CA: 2023 Boreal Mega-Fires',
    country: 'Canada',
    month: '2023-07',
    center: [-115.0, 56.5],
    zoom: 4.8,
    description: 'Record-shattering 18M+ hectares burned across boreal forests.',
  },
  {
    name: 'US: 2020 California Fire Storm',
    country: 'United States',
    month: '2020-09',
    center: [-121.5, 39.5],
    zoom: 5.8,
    description: 'August Complex & Creek Fire burned millions of acres.',
  },
];
