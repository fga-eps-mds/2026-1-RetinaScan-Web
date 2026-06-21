import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../api/getDashboardMetrics';
import type { GetMetricsFilters } from '../types/dashboard-result';

export const useGetMetrics = (filters?: GetMetricsFilters) => {
  return useQuery({
    queryKey: ['exam-metrics', filters],
    queryFn: () => getDashboardMetrics(filters),
    // Evita refazer a requisição a cada pequena interação na tela
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
};