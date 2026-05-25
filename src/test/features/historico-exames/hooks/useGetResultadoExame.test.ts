import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGetResultadoExame } from '@/features/historico-exames/hooks/useGetResultadoExame';
import { getResultadoExame } from '@/features/historico-exames/api/getResultadoExame';

// 1. Mock da função de API que o hook chama internamente
vi.mock('@/features/historico-exames/api/getResultadoExame', () => ({
  getResultadoExame: vi.fn(),
}));

// 2. Configuração do Wrapper do React Query para os testes
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Desliga o retry automático para que os testes de erro falhem instantaneamente
        retry: false, 
      },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  function Wrapper(props: { children: React.ReactNode }) {
    return QueryClientProvider({ client: queryClient, children: props.children });
  }
  return Wrapper;
};

describe('useGetResultadoExame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve executar a query se o examId não for fornecido (enabled: false)', () => {
    const { result } = renderHook(() => useGetResultadoExame(undefined), {
      wrapper: createWrapper(),
    });

    // fetchStatus 'idle' significa que o React Query pausou a requisição
    expect(result.current.fetchStatus).toBe('idle');
    
    // No TanStack Query v5+, uma query desabilitada fica como pending (pendente de dados) 
    // mas isLoading fica como false (pois não há nenhuma requisição de rede em andamento)
    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(false); 
    
    // A função da API não pode ter sido chamada
    expect(getResultadoExame).not.toHaveBeenCalled();
  });

  it('deve buscar os dados com sucesso quando um examId for fornecido', async () => {
    // Mock do retorno da API
    const mockData = {
      exam: { id: 'EX-123', status: 'CONCLUIDO' },
      imagens: [],
      resultadosIa: [],
    };
    vi.mocked(getResultadoExame).mockResolvedValueOnce(mockData as any);

    const { result } = renderHook(() => useGetResultadoExame('EX-123'), {
      wrapper: createWrapper(),
    });

    // Aguarda o status da query mudar para sucesso
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verifica se os dados chegaram no state do hook
    expect(result.current.data).toEqual(mockData);
    
    // Confirma se a API foi chamada com o ID correto
    expect(getResultadoExame).toHaveBeenCalledWith('EX-123');
  });

  it('deve lidar com erros caso a API falhe', async () => {
    // Simula uma falha no servidor
    vi.mocked(getResultadoExame).mockRejectedValueOnce(new Error('Erro na API'));

    const { result } = renderHook(() => useGetResultadoExame('EX-123'), {
      wrapper: createWrapper(),
    });

    // Aguarda o status da query mudar para erro
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Confirma se o erro foi capturado pelo hook
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Erro na API');
  });
});