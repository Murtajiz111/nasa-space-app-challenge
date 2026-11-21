import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';

export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: api.meta,
    staleTime: 10 * 60 * 1000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    staleTime: 30 * 1000,
  });
}

export function useCalendar() {
  const { country, yearStart, yearEnd, includePartial } = useStore();
  return useQuery({
    queryKey: ['calendar', country, yearStart, yearEnd, includePartial],
    queryFn: () => api.calendar(country, yearStart, yearEnd, includePartial),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTimeseries() {
  const { country, yearStart, yearEnd, includePartial, bounds } = useStore();
  return useQuery({
    queryKey: ['timeseries', country, yearStart, yearEnd, includePartial, bounds],
    queryFn: () => api.timeseries(country, yearStart, yearEnd, includePartial, bounds),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAnomaly() {
  const { country, yearStart, yearEnd, includePartial } = useStore();
  return useQuery({
    queryKey: ['anomaly', country, yearStart, yearEnd, includePartial],
    queryFn: () => api.anomaly(country, yearStart, yearEnd, includePartial),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCells() {
  const { country, selectedMonth, bounds } = useStore();
  return useQuery({
    queryKey: ['cells', country, selectedMonth, bounds],
    queryFn: () => api.cells(country, selectedMonth!, bounds),
    enabled: !!selectedMonth,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSummary() {
  const { yearStart, yearEnd, includePartial } = useStore();
  return useQuery({
    queryKey: ['summary', yearStart, yearEnd, includePartial],
    queryFn: () => api.summary(yearStart, yearEnd, includePartial),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCompare() {
  const { country, yearStart, yearEnd, includePartial } = useStore();
  return useQuery({
    queryKey: ['compare', country, yearStart, yearEnd, includePartial],
    queryFn: () => api.compare(country, Math.max(yearStart, 2012), yearEnd, includePartial),
    staleTime: 10 * 60 * 1000,
  });
}
