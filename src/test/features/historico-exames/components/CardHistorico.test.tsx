import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
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

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: {
        total: 2,
        page: 1,
        totalPages: 2,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);
  });

  it('deve renderizar os exames retornados pela query', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
      </MemoryRouter>
    );

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
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
      </MemoryRouter>
    );

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
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
      </MemoryRouter>
    );

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
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: {
        total: 0,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/ainda não existem exames registrados/i)
    ).toBeInTheDocument();
  });

  // it('deve mostrar erro de validação quando o ID digitado for inválido', async () => {
  //   vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
  //     data: mockDados,
  //     isLoading: false,
  //     isError: false,
  //     isFetching: false,
  //     refetch: mockRefetch,
  //   } as any);

  //   render(
  //     <MemoryRouter>
  //       <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
  //     </MemoryRouter>
  //   );

  //   const inputBusca = screen.getByPlaceholderText(/buscar exame/i);

  //   fireEvent.change(inputBusca, { target: { value: 'ID-ERRADO' } });

  //   expect(
  //     await screen.findByText(/formato de id inválido/i)
  //   ).toBeInTheDocument();

  //   expect(inputBusca).toHaveClass('border-red-500');
  // });

  // it('deve chamar refetch ao clicar no botão de atualizar lista', async () => {
  //   vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
  //     data: mockDados,
  //     isLoading: false,
  //     isError: false,
  //     isFetching: false,
  //     refetch: mockRefetch,
  //   } as any);

  //   render(
  //     <MemoryRouter>
  //       <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
  //     </MemoryRouter>
  //   );

  //   const refreshButton = screen.getByRole('button', {
  //     name: /atualizar lista de exames/i,
  //   });

  //   fireEvent.click(refreshButton);

  //   expect(mockRefetch).toHaveBeenCalled();
  // });

  it('deve chamar onPageChange ao clicar na próxima página', async () => {
    const onPageChange = vi.fn();

    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: {
        total: 40,
        page: 1,
        totalPages: 2,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={1} pageSize={20} onPageChange={onPageChange} />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1];

    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('deve navegar para a página do exame ao clicar na linha', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
      </MemoryRouter>
    );

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
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={1} pageSize={20} onPageChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/atualizando resultados/i)
    ).toBeInTheDocument();
  });

  it('deve chamar onPageChange(1) ao digitar na busca', async () => {
    const onPageChange = vi.fn();

    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockDados,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={2} pageSize={20} onPageChange={onPageChange} />
      </MemoryRouter>
    );

    const inputBusca = screen.getByPlaceholderText(/buscar exame/i);

    fireEvent.change(inputBusca, { target: { value: 'Bruno' } });

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('deve limpar os filtros ao clicar em limpar filtros', async () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: {
        total: 0,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <CardHistorico page={2} pageSize={20} onPageChange={vi.fn()} />
      </MemoryRouter>
    );

    const inputBusca = screen.getByPlaceholderText(/buscar exame/i);

    fireEvent.change(inputBusca, { target: { value: 'Paciente Inexistente' } });

    expect(
      await screen.findByText(/nenhum resultado encontrado/i)
    ).toBeInTheDocument();

    const btnLimpar = screen.getByRole('button', { name: /limpar filtros/i });

    fireEvent.click(btnLimpar);

    await waitFor(() => {
      expect(inputBusca).toHaveValue('');
    });
  });
});
