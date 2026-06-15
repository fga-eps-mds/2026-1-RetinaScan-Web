import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Ajuste os caminhos de importação conforme o seu projeto
import { useValidateInscricaoToken } from '@/features/auth/hooks/useValidateInscricaoToken';
import { validateInscricaoToken } from '@/features/auth/api/validateInscricaoToken';

vi.mock('@/features/auth/api/validateInscricaoToken', () => ({
  validateInscricaoToken: vi.fn(),
}));

describe('useValidateInscricaoToken', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve chamar a API e retornar os dados quando o token for válido', async () => {
    const mockToken = 'token-123';
    const mockData = { email: 'teste@teste.com', nomeCompleto: 'João' };

    vi.mocked(validateInscricaoToken).mockResolvedValueOnce(mockData as any);

    const { result } = renderHook(() => useValidateInscricaoToken(mockToken), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Como o queryFn é `() => validateInscricaoToken(token)`, ele recebe os argumentos exatos
    expect(validateInscricaoToken).toHaveBeenCalledTimes(1);
    expect(validateInscricaoToken).toHaveBeenCalledWith(mockToken);
    expect(result.current.data).toEqual(mockData);
  });

  it('NÃO deve chamar a API se o token estiver vazio (regra do enabled)', async () => {
    const { result } = renderHook(() => useValidateInscricaoToken(''), { wrapper });

    // Esperamos um pequeno ciclo para garantir que a requisição não foi disparada
    await waitFor(() => {
      // isPending fica true por padrão, mas fetchStatus é 'idle' quando está pausado pelo `enabled: false`
      expect(result.current.fetchStatus).toBe('idle');
    });

    expect(validateInscricaoToken).not.toHaveBeenCalled();
  });

  it('deve refletir o estado de erro caso a validação falhe', async () => {
    const mockToken = 'token-invalido';
    const mockError = new Error('Token expirado');
    
    vi.mocked(validateInscricaoToken).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useValidateInscricaoToken(mockToken), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});