import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetMinhasSolicitacoesCpfCrm } from '@/features/notificacoes/hooks/useGetMinhasSolicitacoesCpfCrm';
import { getMinhasSolicitacoesCpfCrm } from '@/features/notificacoes/api/getMinhasSolicitacoesCpfCrm';

vi.mock('@/features/notificacoes/api/getMinhasSolicitacoesCpfCrm', () => ({
  getMinhasSolicitacoesCpfCrm: vi.fn(),
}));

describe('useGetMinhasSolicitacoesCpfCrm', () => {
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

  it('deve retornar os dados de solicitações com sucesso', async () => {
    const mockData = [{ id: '1', status: 'PENDENTE' }];
    (getMinhasSolicitacoesCpfCrm as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGetMinhasSolicitacoesCpfCrm(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(getMinhasSolicitacoesCpfCrm).toHaveBeenCalledTimes(1);
  });

  it('deve retornar erro quando a api falhar', async () => {
    (getMinhasSolicitacoesCpfCrm as any).mockRejectedValue(new Error('Erro de carregamento'));

    const { result } = renderHook(() => useGetMinhasSolicitacoesCpfCrm(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Erro de carregamento'));
  });
});