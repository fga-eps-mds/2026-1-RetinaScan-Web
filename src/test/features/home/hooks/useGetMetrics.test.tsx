import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

import { useGetMetrics } from '@/features/home/hooks/useGetMetrics';
import { getDashboardMetrics } from '@/features/home/api/getDashboardMetrics';

// Mockamos apenas a função da API, deixando o React Query funcionar normalmente
vi.mock('@/features/home/api/getDashboardMetrics', () => ({
  getDashboardMetrics: vi.fn(),
}));

// Instância limpa do QueryClient para cada teste (evita cache vazando entre testes)
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Desliga retentativas para o teste falhar/passar rápido
      },
    },
  });

describe('useGetMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve executar a query com sucesso e retornar os dados sem filtros', async () => {
    // Preparação (Arrange)
    const mockData = { volume: { total: 100 }, resultadosIa: { totalResultados: 100 } };
    vi.mocked(getDashboardMetrics).mockResolvedValueOnce(mockData as any);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Ação (Act)
    const { result } = renderHook(() => useGetMetrics(), { wrapper });

    // Verificação (Assert)
    // Aguarda o React Query mudar o status para success
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(getDashboardMetrics).toHaveBeenCalledTimes(1);
    expect(getDashboardMetrics).toHaveBeenCalledWith(undefined);
  });

  it('deve repassar os filtros corretamente para a queryKey e para a API', async () => {
    // Preparação (Arrange)
    const mockData = { volume: { total: 50 }, resultadosIa: { totalResultados: 50 } };
    const mockFilters = { startDate: '2026-06-01', endDate: '2026-06-15' };
    vi.mocked(getDashboardMetrics).mockResolvedValueOnce(mockData as any);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Ação (Act)
    const { result } = renderHook(() => useGetMetrics(mockFilters), { wrapper });

    // Verificação (Assert)
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getDashboardMetrics).toHaveBeenCalledWith(mockFilters);
    // Verifica se a queryKey foi montada corretamente com os filtros
    expect(queryClient.getQueryCache().findAll()).toHaveLength(1);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual(['exam-metrics', mockFilters]);
  });
});