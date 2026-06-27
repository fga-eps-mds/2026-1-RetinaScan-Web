import { useQuery, keepPreviousData } from '@tanstack/react-query'; // <-- Importe o keepPreviousData
import { getDashboardMetrics } from '../api/getDashboardMetrics';
import type { GetMetricsFilters } from '../types/dashboard-result';

export const useGetMetrics = (filters?: GetMetricsFilters) => {
  return useQuery({
    queryKey: ['exam-metrics', filters],
    queryFn: () => getDashboardMetrics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    placeholderData: keepPreviousData,
  });
};