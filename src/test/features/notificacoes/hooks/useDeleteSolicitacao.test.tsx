import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteSolicitacao } from '@/features/notificacoes/hooks/useDeleteSolicitacao';
import { deleteSolicitacao } from '@/features/notificacoes/api/deleteSolicitacaoCrm';
import { notificacaoKeys } from '@/features/notificacoes/api/queryKeys';

vi.mock('../api/deleteSolicitacaoCrm', () => ({
  deleteSolicitacao: vi.fn(),
}));

describe('useDeleteSolicitacao', () => {
  let queryClient: QueryClient;

  // Wrapper para injetar o contexto do React Query no renderHook
  const createWrapper = () => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('deve chamar deleteSolicitacao com o id informado da solicitação', async () => {
    vi.mocked(deleteSolicitacao).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteSolicitacao(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('solicitacao-id-123');
    });

    expect(deleteSolicitacao).toHaveBeenCalledTimes(1);
    expect(vi.mocked(deleteSolicitacao).mock.calls[0][0]).toBe('solicitacao-id-123');
  });

  it('deve invalidar a query de listagem do admin em caso de sucesso', async () => {
    vi.mocked(deleteSolicitacao).mockResolvedValue(undefined);
    
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteSolicitacao(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('solicitacao-id-123');
    });

    // Garante que o invalidateQueries foi chamado com a chave exata configurada no hook
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: notificacaoKeys.solicitacoesCpfCrmList,
    });
  });

  it('deve propagar o erro e não invalidar o cache quando a rota falhar', async () => {
    const erroMock = new Error('Erro ao deletar solicitação no servidor');
    vi.mocked(deleteSolicitacao).mockRejectedValue(erroMock);
    
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteSolicitacao(), {
      wrapper: createWrapper(),
    });

    // Verifica se a Mutation rejeita o erro corretamente para capturarmos no .catch ou toast do componente
    await expect(
      act(async () => {
        await result.current.mutateAsync('solicitacao-id-123');
      })
    ).rejects.toThrow('Erro ao deletar solicitação no servidor');

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});