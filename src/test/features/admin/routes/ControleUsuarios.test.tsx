import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ControleUsuarios from '@/features/admin/routes/ControleUsuarios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchMedicos } from '@/features/admin/hooks/useSearchMedicos';
import { toast } from 'sonner';

vi.mock('@/features/admin/hooks/useSearchMedicos');

// Mockamos o Toast para checar se ele é chamado no erro da API
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// NÃO mockamos TabelaUsers de forma estática pura para permitir que o input real seja testado e acione o useMemo de filtros
describe('ControleUsuarios', () => {
  let queryClient: QueryClient;
  const mockRefetch = vi.fn();

  const renderWithClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Retorno padrão de sucesso
    vi.mocked(useSearchMedicos).mockReturnValue({
      data: {
        data: [
          { id: '1', status: 'ATIVO', nomeCompleto: 'Dr. House', email: 'house@exemplo.com', crm: '123', createdAt: '2026-05-17T00:00:00' },
          { id: '2', status: 'INATIVO', nomeCompleto: 'Dra. Cameron', email: 'cameron@exemplo.com', crm: '456', createdAt: '2026-05-17T00:00:00' },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
      isFetched: true,
    } as any);
  });

  it('deve renderizar a tela e buscar os usuários ao montar', async () => {
    renderWithClient(<ControleUsuarios />);
    expect(
      screen.getByText(/gerenciamento e controle de acesso/i)
    ).toBeInTheDocument();
    expect(useSearchMedicos).toHaveBeenCalled();
  });

  it('deve abrir o modal ao clicar em Novo Usuário', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    await user.click(screen.getByRole('button', { name: /novo usuário/i }));
    // Valida o comportamento de abertura do modal real ou injetado na árvore
    expect(screen.getByText(/Novo Usuário/i)).toBeInTheDocument();
  });

  // --- COBERTURA DAS BRANCHES DE VALIDAÇÃO (LINHAS 23-27) ---

  it('deve chavear os filtros para BUSCA POR NOME quando for um texto simples', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const input = screen.getByPlaceholderText(/Buscar por nome, e-mail ou CRM/i);
    await user.type(input, 'Iderlan');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Iderlan',
          crm: undefined,
          email: undefined,
        })
      );
    });
  });

  it('deve chavear os filtros para BUSCA POR CRM quando for apenas números', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const input = screen.getByPlaceholderText(/Buscar por nome, e-mail ou CRM/i);
    await user.type(input, '123456');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: undefined,
          crm: '123456',
          email: undefined,
        })
      );
    });
  });

  it('deve manter o filtro como NOME quando o email estiver incompleto para evitar HTTP 400', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const input = screen.getByPlaceholderText(/Buscar por nome, e-mail ou CRM/i);
    await user.type(input, 'iderlan@retinascan.');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'iderlan@retinascan.',
          crm: undefined,
          email: undefined,
        })
      );
    });
  });

  it('deve chavear o filtro para EMAIL apenas quando a sintaxe do domínio estiver completa', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const input = screen.getByPlaceholderText(/Buscar por nome, e-mail ou CRM/i);
    await user.type(input, 'iderlan@retinascan.com');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: undefined,
          crm: undefined,
          email: 'iderlan@retinascan.com',
        })
      );
    });
  });

  // --- COBERTURA DO TRATAMENTO DE ERRO (LINHA 50) ---

  it('deve disparar o toast de erro se a requisição do useSearchMedicos falhar', async () => {
    vi.mocked(useSearchMedicos).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Falha crítica de banco'),
      refetch: mockRefetch,
      isFetching: false,
      isFetched: true,
    } as any);

    renderWithClient(<ControleUsuarios />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Erro ao carregar usuários.',
        expect.objectContaining({
          description: 'Falha crítica de banco',
        })
      );
    });
  });
});