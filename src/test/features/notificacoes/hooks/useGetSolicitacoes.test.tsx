import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetSolicitacoes } from '@/features/notificacoes/hooks/useGetSolicitacoes';
import { getSolicitacoesCpfCrm } from '@/features/notificacoes/api/getSolicitacoesCpfCrm';

vi.mock('@/features/notificacoes/api/getSolicitacoesCpfCrm', () => ({
  getSolicitacoesCpfCrm: vi.fn(),
}));

describe('useGetSolicitacoes', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve retornar a lista de todas as solicitações com sucesso', async () => {
    const mockData = [
      { id: '1', status: 'PENDENTE', nome: 'Dr. Silva' },
      { id: '2', status: 'PENDENTE', nome: 'Dra. Maria' }
    ];
    (getSolicitacoesCpfCrm as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGetSolicitacoes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(getSolicitacoesCpfCrm).toHaveBeenCalledTimes(1);
  });

  it('deve lidar com falha na busca das solicitações', async () => {
    (getSolicitacoesCpfCrm as any).mockRejectedValue(new Error('Falha na API'));

    const { result } = renderHook(() => useGetSolicitacoes(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Falha na API'));
  });
});