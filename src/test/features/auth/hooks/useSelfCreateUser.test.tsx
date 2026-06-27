import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Ajuste os caminhos conforme a sua estrutura real
import { useSubmitInscricao } from '@/features/auth/hooks/useSelfCreateUser';
import { submitInscricao } from '@/features/auth/api/selfcreateUser';

// Mockamos a função de API que o hook consome internamente
vi.mock('@/features/auth/api/selfcreateUser', () => ({
  submitInscricao: vi.fn(),
}));

describe('useSubmitInscricao', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Instanciamos um client limpo e sem retries para o teste não ficar lento em caso de erro
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

  it('deve chamar a API com o payload correto ao realizar a mutation', async () => {
    const mockPayload = {
      token: 'token-123',
      nomeCompleto: 'Dra. Ana Silva',
      cpf: '12345678900',
      crm: '123456DF',
      dtNascimento: '1990-01-01',
      senha: 'senha123',
    };

    vi.mocked(submitInscricao).mockResolvedValueOnce({ sucesso: true });

    const { result } = renderHook(() => useSubmitInscricao(), { wrapper });

    // Executa a mutation
    result.current.mutate(mockPayload as any);

    await waitFor(() => {
      // Usamos expect.anything() para ignorar os meta-dados injetados pelo React Query no 2º argumento
      expect(submitInscricao).toHaveBeenCalledWith(mockPayload, expect.anything());
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('deve refletir o estado de erro caso a chamada da API falhe', async () => {
    const mockPayload = {
      token: 'token-invalido',
      nomeCompleto: 'João',
      cpf: '000',
      crm: '000',
      dtNascimento: '2000-01-01',
      senha: '123',
    };
    
    const mockError = new Error('Erro na requisição');
    vi.mocked(submitInscricao).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useSubmitInscricao(), { wrapper });

    result.current.mutate(mockPayload as any);

    await waitFor(() => {
      // Garante que o hook capturou e armazenou o erro corretamente
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });
  });
});