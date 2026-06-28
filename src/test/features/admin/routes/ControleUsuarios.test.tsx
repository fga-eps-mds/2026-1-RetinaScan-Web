import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ControleUsuarios from '@/features/admin/routes/ControleUsuarios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchMedicos } from '@/features/admin/hooks/useSearchMedicos';

vi.mock('@/features/admin/hooks/useSearchMedicos');

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
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

  const getSearchInput = () => screen.getByPlaceholderText(/Buscar por nome, e-mail/i);

  it('deve renderizar a tela e buscar os usuários ao montar', async () => {
    renderWithClient(<ControleUsuarios />);
    expect(screen.getByText(/gerenciamento e controle de acesso/i)).toBeInTheDocument();
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