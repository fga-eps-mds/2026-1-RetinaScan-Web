import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAvaliarInscricao } from '@/features/notificacoes/hooks/useAvaliarInscricao';
import { avaliarInscricao } from '@/features/notificacoes/api/avaliarInscricao';

vi.mock('@/features/notificacoes/api/avaliarInscricao', () => ({
  avaliarInscricao: vi.fn(),
}));

describe('useAvaliarInscricao', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve chamar a API e invalidar a query de inscricoes ao ter sucesso', async () => {
    const mockId = 'INSC-123';
    const mockPayload = { decisao: 'APROVADA' as const };
    const mockResponse = { success: true };

    vi.mocked(avaliarInscricao).mockResolvedValue(mockResponse);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAvaliarInscricao(), { wrapper });

    result.current.mutate({ id: mockId, payload: mockPayload });

    await waitFor(() => {
      expect(avaliarInscricao).toHaveBeenCalledWith(mockId, mockPayload);
      
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['inscricoes'],
      });
    });
  });

  it('deve repassar o erro e NÃO invalidar a query se a chamada falhar', async () => {
    const mockId = 'INSC-123';
    const mockPayload = { decisao: 'REJEITADA' as const, motivoRejeicao: 'Falta doc' };
    
    vi.mocked(avaliarInscricao).mockRejectedValue(new Error('Erro na API'));

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAvaliarInscricao(), { wrapper });

    result.current.mutate({ id: mockId, payload: mockPayload });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    });
  });
});