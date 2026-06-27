import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetSolicitacoes, type GetSolicitacoesParams } from '@/features/notificacoes/hooks/useGetSolicitacoes';
import { getSolicitacoesCpfCrm } from '@/features/notificacoes/api/getSolicitacoesCpfCrm';

vi.mock('@/features/notificacoes/api/getSolicitacoesCpfCrm', () => ({
  getSolicitacoesCpfCrm: vi.fn(),
}));

describe('useGetSolicitacoes', () => {
  let queryClient: QueryClient;

  // Recria o wrapper dinamicamente para garantir um QueryClient limpo por suite
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
          gcTime: Infinity 
        },
      },
    });
  });

  it('deve retornar a lista de todas as solicitações com sucesso usando filtros padrões vazios', async () => {
    const mockData = [
      { id: '1', status: 'PENDENTE', nome: 'Dr. Silva' },
      { id: '2', status: 'PENDENTE', nome: 'Dra. Maria' }
    ];
    vi.mocked(getSolicitacoesCpfCrm).mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useGetSolicitacoes(), { 
      wrapper: createWrapper() 
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(getSolicitacoesCpfCrm).toHaveBeenCalledWith({});
  });

  it('deve repassar os filtros corretamente para a chamada da API', async () => {
    vi.mocked(getSolicitacoesCpfCrm).mockResolvedValue([] as any);

    const filtros: GetSolicitacoesParams = {
      status: 'PENDENTE',
      nome: 'Gustavo',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    const { result } = renderHook(() => useGetSolicitacoes(filtros), { 
      wrapper: createWrapper() 
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(getSolicitacoesCpfCrm).toHaveBeenCalledWith(filtros);
  });

  it('deve disparar uma nova requisição quando as propriedades dos filtros mudarem', async () => {
    vi.mocked(getSolicitacoesCpfCrm).mockResolvedValue([] as any);

    // Renderiza inicialmente filtrando por PENDENTE
    const { rerender, result } = renderHook(
      (props: GetSolicitacoesParams) => useGetSolicitacoes(props),
      {
        wrapper: createWrapper(),
        initialProps: { status: 'PENDENTE' },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getSolicitacoesCpfCrm).toHaveBeenCalledTimes(1);
    expect(getSolicitacoesCpfCrm).toHaveBeenCalledWith({ status: 'PENDENTE' });

    // Modifica a prop do filtro simulando a troca do Select para ACEITO na tela
    rerender({ status: 'ACEITO' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(getSolicitacoesCpfCrm).toHaveBeenCalledTimes(2);
    expect(getSolicitacoesCpfCrm).toHaveBeenLastCalledWith({ status: 'ACEITO' });
  });

  it('deve lidar com falha na busca das solicitações', async () => {
    vi.mocked(getSolicitacoesCpfCrm).mockRejectedValue(new Error('Falha na API'));

    const { result } = renderHook(() => useGetSolicitacoes(), { 
      wrapper: createWrapper() 
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Falha na API'));
  });
});