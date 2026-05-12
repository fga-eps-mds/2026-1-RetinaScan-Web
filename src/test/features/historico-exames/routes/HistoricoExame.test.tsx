import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import HistoricoExame from '@/features/historico-exames/routes/HistoricoExame';
import { toast } from 'sonner';
import type { ExameHistory } from '@/features/historico-exames/types/exam-history';
import * as useGetExamsHook from '@/features/historico-exames/hooks/useGetExams';
import * as usePaginationHook from '@/features/historico-exames/hooks/useGetTotalPages';

vi.mock('@/features/historico-exames/hooks/useGetExams', () => ({
  useGetExams: vi.fn(),
}));

vi.mock('@/features/historico-exames/hooks/useGetTotalPages', () => ({
  useExamsPagination: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({ data: { user: { id: 'test-user' } } })),
  },
  useSession: vi.fn(() => ({ data: { user: { id: 'test-user' } } })),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('HistoricoExame Page', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePaginationHook.useExamsPagination).mockReturnValue({
      data: {
        total: 1,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);
  });

  it('deve mostrar o estado de loading ao iniciar', () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <HistoricoExame />
      </MemoryRouter>
    );

    expect(screen.getByText(/histórico de exames/i)).toBeInTheDocument();
  });

  it('deve carregar e renderizar os dados com sucesso', async () => {
    const mockData: ExameHistory[] = [
      {
        id: 'EX-1111-2222',
        nomeCompleto: 'João Silva',
        olho: 'AO',
        scoreIA: '85',
        status: 'Normal',
        dtCriacao: '2026-05-10T10:00:00.000Z',
      },
    ];

    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mockRefetch,
    } as any);

    render(
      <MemoryRouter>
        <HistoricoExame />
      </MemoryRouter>
    );

    expect(await screen.findByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('EX-1111-2222')).toBeInTheDocument();
  });

  // it('deve lidar com erro de carregamento e disparar o toast', async () => {
  //   vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
  //     data: [],
  //     isLoading: false,
  //     isError: true,
  //     isFetching: false,
  //     refetch: mockRefetch,
  //   } as any);

  //   render(
  //     <MemoryRouter>
  //       <HistoricoExame />
  //     </MemoryRouter>
  //   );

  //   expect(
  //     await screen.findByText(/não foi possível carregar os exames/i)
  //   ).toBeInTheDocument();

  //   expect(toast.error).toHaveBeenCalled();
  // });

  it('deve mostrar estado vazio quando não houver exames', async () => {
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
        <HistoricoExame />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/ainda não existem exames registrados/i)
    ).toBeInTheDocument();
  });
});
