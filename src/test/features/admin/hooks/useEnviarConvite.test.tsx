import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEnviarConvite } from '@/features/admin/hooks/useEnviarConvite';
import { enviarConvite } from '@/features/admin/api/enviarConvite';
import { toast } from 'sonner';

// 1. Mock da requisição da API
vi.mock('@/features/admin/api/enviarConvite', () => ({
  enviarConvite: vi.fn(),
}));

// 2. Mock dos Toasts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

describe('useEnviarConvite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    vi.clearAllMocks();
    // Cria um novo QueryClient zerado para evitar cache entre os testes
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  // Wrapper necessário para o React Query funcionar no renderHook
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve exibir toast de sucesso e chamar o callback quando enviar com sucesso', async () => {
    // Arrange
    const mockCallback = vi.fn();
    (enviarConvite as ReturnType<typeof vi.fn>).mockResolvedValue({
      enviados: 2,
      ignorados: 0,
      detalhes: [],
    });

    const { result } = renderHook(() => useEnviarConvite(mockCallback), { wrapper });

    // Act
    result.current.mutate({ convites: [] });

    // Assert
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('2 convites enviados com sucesso!');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  it('deve exibir toast de warning se houver convites ignorados', async () => {
    // Arrange
    (enviarConvite as ReturnType<typeof vi.fn>).mockResolvedValue({
      enviados: 1,
      ignorados: 1,
      detalhes: [
        { email: 'teste@email.com', status: 'ignorado', motivo: 'Usuário já existe' },
      ],
    });

    const { result } = renderHook(() => useEnviarConvite(), { wrapper });

    // Act
    result.current.mutate({ convites: [] });

    // Assert
    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        '1 convite(s) enviado(s), 1 ignorado(s).',
        { description: 'teste@email.com: Usuário já existe' }
      );
      // O callback de sucesso não deve ser chamado neste cenário, conforme sua lógica
    });
  });

  it('deve exibir toast neutro (message) se nenhum convite foi enviado nem ignorado', async () => {
    // Arrange
    (enviarConvite as ReturnType<typeof vi.fn>).mockResolvedValue({
      enviados: 0,
      ignorados: 0,
      detalhes: [],
    });

    const { result } = renderHook(() => useEnviarConvite(), { wrapper });

    // Act
    result.current.mutate({ convites: [] });

    // Assert
    await waitFor(() => {
      expect(toast.message).toHaveBeenCalledWith('Nenhum convite foi enviado.');
    });
  });

  it('deve exibir toast de erro com a mensagem da API em caso de falha', async () => {
    // Arrange
    const erroMock = {
      response: { data: { message: 'Erro interno no servidor' } },
    };
    (enviarConvite as ReturnType<typeof vi.fn>).mockRejectedValue(erroMock);

    const { result } = renderHook(() => useEnviarConvite(), { wrapper });

    // Act
    result.current.mutate({ convites: [] });

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao enviar convite.', {
        description: 'Erro interno no servidor',
      });
    });
  });
});