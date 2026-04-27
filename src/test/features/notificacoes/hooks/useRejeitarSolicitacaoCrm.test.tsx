import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRejeitarSolicitacaoCrm } from '@/features/notificacoes/hooks/useRejeitarSolicitacaoCrm';
import { rejeitarSolicitacaoCrm } from '@/features/notificacoes/api/rejeitarSolicitacaoCrm';
import { notificacaoKeys } from '@/features/notificacoes/api/queryKeys';

vi.mock('@/features/notificacoes/api/rejeitarSolicitacaoCrm', () => ({
  rejeitarSolicitacaoCrm: vi.fn(),
}));

describe('useRejeitarSolicitacaoCrm', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

  it('deve chamar rejeitarSolicitacaoCrm com os parâmetros corretos e invalidar queries no sucesso', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const mockParams = { id: '123', motivoRejeicao: 'Documento inválido' };
    (rejeitarSolicitacaoCrm as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useRejeitarSolicitacaoCrm(), { wrapper });

    result.current.mutate(mockParams);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(rejeitarSolicitacaoCrm).toHaveBeenCalledWith(mockParams);
    
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: notificacaoKeys.solicitacoesCpfCrmList,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: notificacaoKeys.minhasSolicitacoesCpfCrm,
    });
  });

  it('deve lidar com erro na rejeição', async () => {
    (rejeitarSolicitacaoCrm as any).mockRejectedValue(new Error('Erro ao rejeitar'));

    const { result } = renderHook(() => useRejeitarSolicitacaoCrm(), { wrapper });

    result.current.mutate({ id: '1', motivoRejeicao: 'erro' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Erro ao rejeitar'));
  });
});