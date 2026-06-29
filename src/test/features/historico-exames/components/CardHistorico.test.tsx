import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CardHistorico } from '@/features/historico-exames';
import * as useGetExamsHook from '@/features/historico-exames/hooks/useGetExams';
import * as usePaginationHook from '@/features/historico-exames/hooks/useGetTotalPages';
import type { ExameHistory } from '@/features/historico-exames/types/exam-history';

const navigateMock = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/historico-exames/hooks/useGetExams', () => ({
  useGetExams: vi.fn(),
}));

vi.mock('@/features/historico-exames/hooks/useGetTotalPages', () => ({
  useExamsPagination: vi.fn(),
}));

vi.mock('@/features/historico-exames/hooks/useExamEditingLocks', () => ({
  useExamEditingLocks: () => ({
    data: {},
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/historico-exames/hooks/useDebounce', () => ({
  useDebouncedValue: (value: string) => value,
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: { tipoPerfil: 'ESPECIALISTA' },
      },
    }),
  },
}));

const mockDados: ExameHistory[] = [
  {
    id: 'EX-1234-5678',
    nomeCompleto: 'Ana Silva',
    olho: 'OD' as any,
    scoreIA: '90',
    status: 'Normal',
    dtCriacao: '2026-05-10T10:00:00.000Z',
  },
  {
    id: 'EX-0000-1111',
    nomeCompleto: 'Bruno Costa',
    olho: 'OE' as any,
    scoreIA: '30',
    status: 'Normal',
    dtCriacao: '2026-05-09T10:00:00.000Z',
  },
];

describe('CardHistorico', () => {
  const mockRefetch = vi.fn();
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: {
        total: 2,
        page: 1,
        totalPages: 2,
        pageSize: 20,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CardHistorico />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('deve renderizar os exames retornados pela query', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    expect(await screen.findByText('Ana Silva')).toBeInTheDocument();
    expect(screen.getByText('Bruno Costa')).toBeInTheDocument();
    expect(screen.getByText('EX-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('EX-0000-1111')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando a query falhar', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    expect(
      await screen.findByText(/não foi possível carregar os exames/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /tentar novamente/i })
    ).toBeInTheDocument();
  });

  it('deve chamar refetch ao clicar em tentar novamente no estado de erro', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    fireEvent.click(
      await screen.findByRole('button', { name: /tentar novamente/i })
    );

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('deve mostrar estado vazio quando não houver exames e não houver filtros ativos', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: { total: 0, page: 1, totalPages: 1, pageSize: 20 },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(
      await screen.findByText(/ainda não existem exames registrados/i)
    ).toBeInTheDocument();
  });

  it('deve tratar ID inválido como busca por nome, e não como id exato', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    const inputBusca = screen.getByPlaceholderText(/buscar exame/i);
    fireEvent.change(inputBusca, { target: { value: 'EX-123' } });

    await waitFor(() => {
      expect(useGetExamsHook.useGetExams).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 10,
          nomeCompleto: 'EX-123',
          id: '',
        })
      );
    });

    expect(inputBusca).toHaveValue('EX-123');
  });

  it('deve tratar ID válido como busca por id exato', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    const inputBusca = screen.getByPlaceholderText(/buscar exame/i);
    fireEvent.change(inputBusca, { target: { value: 'EX-1234-5678' } });

    await waitFor(() => {
      expect(useGetExamsHook.useGetExams).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 10,
          nomeCompleto: '',
          id: 'EX-1234-5678',
        })
      );
    });
  });

  it('deve chamar refetch ao clicar no botão de atualizar lista', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: /atualizar lista de exames/i })
    );

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('deve avançar para a próxima página ao clicar no botão de próxima página', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: { total: 40, page: 1, totalPages: 2, pageSize: 20 },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1];

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(useGetExamsHook.useGetExams).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('deve navegar para a página do exame ao clicar na linha', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    fireEvent.click(
      screen.getByRole('link', {
        name: /abrir resultado do exame ex-1234-5678/i,
      })
    );

    expect(navigateMock).toHaveBeenCalledWith('/exames/EX-1234-5678');
  });

  it('deve mostrar indicador de atualização quando estiver fetching', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: true,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    expect(
      await screen.findByText(/atualizando resultados/i)
    ).toBeInTheDocument();
  });

  it('deve resetar para página 1 ao digitar na busca', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: { total: 40, page: 1, totalPages: 2, pageSize: 20 },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);

    const inputBusca = screen.getByPlaceholderText(/buscar exame/i);
    fireEvent.change(inputBusca, { target: { value: 'Bruno' } });

    await waitFor(() => {
      expect(useGetExamsHook.useGetExams).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });
  });

  it('deve limpar os filtros ao clicar em limpar filtros', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: { total: 0, page: 1, totalPages: 1, pageSize: 20 },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    const inputBusca = screen.getByPlaceholderText(/buscar exame/i);
    fireEvent.change(inputBusca, { target: { value: 'Paciente Inexistente' } });

    expect(
      await screen.findByText(/nenhum resultado encontrado/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /limpar filtros/i }));

    await waitFor(() => {
      expect(inputBusca).toHaveValue('');
    });
  });
});
