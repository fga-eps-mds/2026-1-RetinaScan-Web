import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ControleUsuarios from '@/features/admin/routes/ControleUsuarios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchMedicos } from '@/features/admin/hooks/useSearchMedicos';
import { toast } from 'sonner';

// Mocks Principais
vi.mock('@/features/admin/hooks/useSearchMedicos');

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock do Modal usando o caminho absoluto correto para o Vitest interceptar
vi.mock('@/features/admin/components/ModalNovoUser', () => ({
  default: ({ isOpen, onClose, onUserCreated }: any) => isOpen ? (
    <div data-testid="mock-modal-novo-user">
      <button data-testid="mock-close-modal" onClick={onClose}>Fechar Modal</button>
      <button data-testid="mock-user-created" onClick={onUserCreated}>Simular Criacao</button>
    </div>
  ) : null,
}));

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

    vi.mocked(useSearchMedicos).mockReturnValue({
      data: {
        data: [
          { id: '1', status: 'ATIVO', nomeCompleto: 'Dr. House', email: 'house@exemplo.com', crm: '123', createdAt: '2026-05-17T00:00:00', tipoPerfil: 'MEDICO' },
          { id: '2', status: 'INATIVO', nomeCompleto: 'Dr. John', email: 'john@exemplo.com', crm: '456', createdAt: '2026-05-17T00:00:00', tipoPerfil: 'MEDICO' },
        ],
        pagination: { totalPages: 3, total: 20 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
      isFetched: true,
    } as any);
  });

  const getSearchInput = () => screen.getByPlaceholderText(/Buscar por nome, e-mail/i);

  it('deve renderizar a tela e buscar os usuários ao montar', async () => {
    renderWithClient(<ControleUsuarios />);
    expect(screen.getByText(/gerenciamento e controle de acesso/i)).toBeInTheDocument();
  });

  it('deve exibir um toast de erro contendo a message quando a chamada falhar instanciando Error', async () => {
    vi.mocked(useSearchMedicos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Erro crítico do backend'),
      refetch: mockRefetch,
      isFetching: false,
      isFetched: true,
    } as any);

    renderWithClient(<ControleUsuarios />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar usuários.', {
        description: 'Erro crítico do backend',
      });
    });
  });

  it('deve exibir um toast de erro contendo o fallback padrão quando a chamada falhar sem Error instance', async () => {
    vi.mocked(useSearchMedicos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: 'Apenas uma string de erro',
      refetch: mockRefetch,
      isFetching: false,
      isFetched: true,
    } as any);

    renderWithClient(<ControleUsuarios />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar usuários.', {
        description: 'Erro na requisição da API.',
      });
    });
  });

  it('deve alterar a página ao acionar a navegação pela TabelaUsers', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const buttons = screen.getAllByRole('button');
    const prevPageBtn = buttons[buttons.length - 2];
    const nextPageBtn = buttons[buttons.length - 1];

    await user.click(nextPageBtn);
    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });

    await user.click(prevPageBtn);
    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
    });
  });

  it('deve abrir e fechar o ModalNovoUser corretamente ao cancelar', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const novoUserBtn = screen.getByRole('button', { name: /novo usuário/i });
    await user.click(novoUserBtn);
    
    expect(screen.getByTestId('mock-modal-novo-user')).toBeInTheDocument();

    const closeModalBtn = screen.getByTestId('mock-close-modal');
    await user.click(closeModalBtn);

    expect(screen.queryByTestId('mock-modal-novo-user')).not.toBeInTheDocument();
  });

  it('deve executar o refetch e fechar o modal quando um usuário for criado com sucesso', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const novoUserBtn = screen.getByRole('button', { name: /novo usuário/i });
    await user.click(novoUserBtn);
    
    const simulateCreationBtn = screen.getByTestId('mock-user-created');
    await user.click(simulateCreationBtn);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
      expect(screen.queryByTestId('mock-modal-novo-user')).not.toBeInTheDocument();
    });
  });

  it('deve chavear os filtros para BUSCA POR NOME quando for um texto simples', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const input = getSearchInput();
    await user.type(input, 'Iderlan');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Iderlan' })
      );
    });
  });

  it('deve chavear os filtros para BUSCA POR CRM quando for apenas números', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const input = getSearchInput();
    await user.type(input, '123456');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({ crm: '123456' })
      );
    });
  });

  it('deve chavear o filtro para EMAIL apenas quando a sintaxe estiver completa', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const input = getSearchInput();
    await user.type(input, 'iderlan@retinascan.com');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'iderlan@retinascan.com' })
      );
    });
  });

  it('deve atualizar o filtro ao alterar o perfil', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    const select = screen.getByTestId('perfil-select');
    await user.selectOptions(select, 'ESPECIALISTA');

    await waitFor(() => {
      expect(useSearchMedicos).toHaveBeenCalledWith(
        expect.objectContaining({ tipoPerfil: 'ESPECIALISTA' })
      );
    });
  });
});