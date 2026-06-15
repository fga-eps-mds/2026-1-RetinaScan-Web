import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAvaliarInscricao } from '@/features/notificacoes/hooks/useAvaliarInscricao';
import { avaliarInscricao } from '@/features/notificacoes/api/avaliarInscricao';

// 1. Faz o mock da chamada de API
vi.mock('@/features/notificacoes/api/avaliarInscricao', () => ({
  avaliarInscricao: vi.fn(),
}));

describe('useAvaliarInscricao', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Instancia um QueryClient real para podermos espionar seus métodos
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  // Wrapper do React Query para injetar no renderHook
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve chamar a API e invalidar a query de pendentes ao ter sucesso', async () => {
    // Arrange
    const mockId = 'INSC-123';
    const mockPayload = { decisao: 'APROVADA' as const };
    const mockResponse = { success: true };

    (avaliarInscricao as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Cria um "espião" no método invalidateQueries do queryClient
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAvaliarInscricao(), { wrapper });

    // Act
    result.current.mutate({ id: mockId, payload: mockPayload });

    // Assert
    await waitFor(() => {
      // Garante que a API foi chamada com os parâmetros certos
      expect(avaliarInscricao).toHaveBeenCalledWith(mockId, mockPayload);
      
      // Garante que a lista de pendentes foi invalidada para forçar o recarregamento
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['inscricoes', 'pendentes'],
      });
    });
  });

  it('deve repassar o erro e NÃO invalidar a query se a chamada falhar', async () => {
    // Arrange
    const mockId = 'INSC-123';
    const mockPayload = { decisao: 'REJEITADA' as const, motivoRejeicao: 'Falta doc' };
    
    (avaliarInscricao as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Erro na API'));

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAvaliarInscricao(), { wrapper });

    // Act
    result.current.mutate({ id: mockId, payload: mockPayload });

    // Assert
    await waitFor(() => {
      // Verifica se o estado de erro foi ativado no hook
      expect(result.current.isError).toBe(true);
      
      // Garante que a query NÃO foi invalidada porque a ação falhou
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    });
  });
});