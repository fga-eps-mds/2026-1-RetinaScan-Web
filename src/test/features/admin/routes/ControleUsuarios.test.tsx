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

// Mock do componente Select do shadcn/ui.
// Assim como na tabela, transformamos em um select HTML simples para o userEvent funcionar de forma previsível.
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange }: any) => (
    <select
      data-testid="perfil-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="TODOS">Todos os Perfis</option>
      <option value="MEDICO">Apenas Médicos</option>
      <option value="ESPECIALISTA">Apenas Especialistas</option>
    </select>
  ),
  SelectContent: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
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
          { id: '1', status: 'ATIVO', nomeCompleto: 'Dr. House', email: 'house@exemplo.com', crm: '123', createdAt: '2026-05-17T00:00:00', tipoPerfil: 'MEDICO' },
          { id: '2', status: 'INATIVO', nomeCompleto: 'Dra. Cameron', email: 'cameron@exemplo.com', crm: '456', createdAt: '2026-05-17T00:00:00', tipoPerfil: 'ESPECIALISTA' },
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

  it('deve renderizar a tela e buscar os usuários ao montar (com tipoPerfil undefined inicialmente)', async () => {
    renderWithClient(<ControleUsuarios />);
    expect(
      screen.getByText(/gerenciamento e controle de acesso/i)
    ).toBeInTheDocument();
    
    // Na primeira renderização com a string vazia, o filtro manda apenas o perfil (que por padrão é undefined para a API)
    expect(useSearchMedicos).toHaveBeenCalledWith(expect.objectContaining({
      tipoPerfil: undefined
    }));
  });

  it('deve abrir o modal ao clicar em Novo Usuário', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    await user.click(screen.getByRole('button', { name: /novo usuário/i }));
    // Valida o comportamento de abertura do modal real ou injetado na árvore
    expect(screen.getByText(/Novo Usuário/i)).toBeInTheDocument();
  });

  // --- COBERTURA DAS BRANCHES DE VALIDAÇÃO DO USEMEMO (TEXTO LIVRE) ---

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
          tipoPerfil: undefined,
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

  // --- NOVOS TESTES: COBERTURA DO FILTRO DE PERFIL ---

  it('deve atualizar o filtro da requisição quando o perfil for alterado para ESPECIALISTA', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const select = screen.getByTestId('perfil-select');
    await user.selectOptions(select, 'ESPECIALISTA');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoPerfil: 'ESPECIALISTA',
        })
      );
    });
  });

  it('deve atualizar o filtro da requisição quando o perfil for alterado para MEDICO', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const select = screen.getByTestId('perfil-select');
    await user.selectOptions(select, 'MEDICO');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoPerfil: 'MEDICO',
        })
      );
    });
  });

  it('deve limpar o filtro de perfil ao selecionar TODOS e manter a busca de texto', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    // 1. Simula uma busca e um perfil
    const input = screen.getByPlaceholderText(/Buscar por nome, e-mail ou CRM/i);
    await user.type(input, '123456');
    const select = screen.getByTestId('perfil-select');
    await user.selectOptions(select, 'MEDICO');

    // 2. Volta o perfil para TODOS
    await user.selectOptions(select, 'TODOS');

    // 3. Garante que a requisição final mantém o CRM da busca, mas anula o perfil
    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({
          crm: '123456',
          tipoPerfil: undefined,
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