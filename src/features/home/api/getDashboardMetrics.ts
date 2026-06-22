import { api } from '@/shared/api';
import type { BackendMetricsResponseDTO, GetMetricsFilters } from '../types/dashboard-result';

export const getDashboardMetrics = async (
  filters?: GetMetricsFilters
): Promise<BackendMetricsResponseDTO> => {
  const response = await api.get<BackendMetricsResponseDTO>('/api/exams/metrics', {
    params: filters,
  });
  
  return response.data;
};