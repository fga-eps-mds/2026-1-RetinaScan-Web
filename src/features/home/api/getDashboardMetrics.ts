import { api } from '@/shared/api';
import type { BackendMetricsResponse, GetMetricsFilters } from '../types/dashboard-result';

export const getDashboardMetrics = async (
  filters?: GetMetricsFilters
): Promise<BackendMetricsResponse> => {
  const response = await api.get<BackendMetricsResponse>('/api/exams/metrics', {
    params: filters,
  });
  
  return response.data;
};