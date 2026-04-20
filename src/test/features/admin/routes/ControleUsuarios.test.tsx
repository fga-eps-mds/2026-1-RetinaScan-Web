import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ControleUsuarios from '@/features/admin/routes/ControleUsuarios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetAllUsers } from '@/features/admin/hooks/useGetAllUsers';

vi.mock('@/features/admin/hooks/useGetAllUsers');

const mockTabelaUsers = vi.fn();
const mockInfoCards = vi.fn();
const mockModalNovoUser = vi.fn();

vi.mock('@/features/admin/components/TabelaUsers', () => ({
  default: (props: any) => {
    mockTabelaUsers(props);
    return <div data-testid="tabela-users">Tabela Users</div>;
  },
}));

vi.mock('@/features/admin/components/InfoCards', () => ({
  default: (props: any) => {
    mockInfoCards(props);
    return <div data-testid="info-cards">Total: {props.totalUsers}</div>;
  },
}));

vi.mock('@/features/admin/components/ModalNovoUser', () => ({
  default: (props: any) => {
    mockModalNovoUser(props);
    return props.isOpen ? (
      <div data-testid="modal-novo-user">
        <button onClick={props.onUserCreated}>Confirmar criação</button>
      </div>
    ) : null;
  },
}));

describe('ControleUsuarios', () => {
  let queryClient: QueryClient;
  const mockRefetch = vi.fn(); // Criamos o mock da função refetch

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

    // Injetamos o mockRefetch no retorno do hook
    vi.mocked(useGetAllUsers).mockReturnValue({
      data: [
        { id: '1', status: 'ATIVO' },
        { id: '2', status: 'INATIVO' },
      ],
      isLoading: false,
      refetch: mockRefetch, // <--- Importante!
    } as any);
  });

  it('deve renderizar a tela e buscar os usuários ao montar', async () => {
    renderWithClient(<ControleUsuarios />);
    expect(
      screen.getByText(/gerenciamento e controle de acesso/i)
    ).toBeInTheDocument();
    expect(useGetAllUsers).toHaveBeenCalled();
  });

  it('deve passar os totais corretos para o InfoCards', async () => {
    renderWithClient(<ControleUsuarios />);
    await waitFor(() => {
      expect(mockInfoCards).toHaveBeenCalledWith(
        expect.objectContaining({
          totalUsers: 2,
          totalActiveUsers: 1,
        })
      );
    });
  });

  it('deve abrir o modal ao clicar em Novo Usuário', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    await user.click(screen.getByRole('button', { name: /novo usuário/i }));
    expect(screen.getByTestId('modal-novo-user')).toBeInTheDocument();
  });

  it('deve fechar o modal e chamar o refetch ao criar um usuário', async () => {
    const user = userEvent.setup();
    renderWithClient(<ControleUsuarios />);

    // Abre o modal
    await user.click(screen.getByRole('button', { name: /novo usuário/i }));

    // Clica no botão que dispara onUserCreated
    await user.click(
      screen.getByRole('button', { name: /confirmar criação/i })
    );

    // Agora o refetch deve ter sido chamado
    expect(mockRefetch).toHaveBeenCalledTimes(1);

    // E o modal deve sumir
    await waitFor(() => {
      expect(screen.queryByTestId('modal-novo-user')).not.toBeInTheDocument();
    });
  });

  it('deve exibir totais zerados quando não houver dados', async () => {
    vi.mocked(useGetAllUsers).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    renderWithClient(<ControleUsuarios />);

    await waitFor(() => {
      expect(mockInfoCards).toHaveBeenCalledWith(
        expect.objectContaining({
          totalUsers: 0,
          totalActiveUsers: 0,
        })
      );
    });
  });
});
