import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { getDashboardMetrics } from '@/features/home/api/getDashboardMetrics';

// Mockamos o cliente HTTP inteiro
vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getDashboardMetrics', () => {
  beforeEach(() => {
    // Limpa o histórico do mock antes de cada teste para evitar interferências
    vi.clearAllMocks();
  });

  it('deve buscar as métricas sem filtros chamando a rota correta', async () => {
    // Preparação (Arrange)
    const mockResponse = { data: { volume: {}, resultadosIa: {} } };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Ação (Act)
    const result = await getDashboardMetrics();

    // Verificação (Assert)
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/api/exams/metrics', { params: undefined });
    expect(result).toEqual(mockResponse.data);
  });

  it('deve buscar as métricas repassando os filtros de data corretamente', async () => {
    // Preparação (Arrange)
    const mockResponse = { data: { volume: {}, resultadosIa: {} } };
    const mockFilters = { startDate: '2026-06-01', endDate: '2026-06-30' };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    // Ação (Act)
    const result = await getDashboardMetrics(mockFilters);

    // Verificação (Assert)
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/api/exams/metrics', { params: mockFilters });
    expect(result).toEqual(mockResponse.data);
  });
});