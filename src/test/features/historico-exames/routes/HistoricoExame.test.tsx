import { waitFor } from '@testing-library/react'; 
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Adicionado
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

// Adicionado mock neutro para o hook de travas de edição concorrente
vi.mock('@/features/historico-exames/hooks/useExamEditingLocks', () => ({
  useExamEditingLocks: () => ({
    data: {},
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

// Atualizado para injetar tipoPerfil: 'ESPECIALISTA' exigido pelo CardHistorico
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({ data: { user: { id: 'test-user', tipoPerfil: 'ESPECIALISTA' } } })),
  },
  useSession: vi.fn(() => ({ data: { user: { id: 'test-user', tipoPerfil: 'ESPECIALISTA' } } })),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('HistoricoExame Page', () => {
  const mockRefetch = vi.fn();
  let queryClient: QueryClient; // Adicionado

  beforeEach(() => {
    vi.clearAllMocks();

    // Instancia um QueryClient novo antes de cada teste
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

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

  // Função auxiliar para injetar os Providers necessários
  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HistoricoExame />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('deve mostrar o estado de loading ao iniciar', () => {
    vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      isFetching: false,
      isFetched: false, // Adicionado para simular o primeiro carregamento
      refetch: mockRefetch,
    } as any);

    renderComponent();

    expect(screen.getByText(/histórico de exames/i)).toBeInTheDocument();
  });

  it('deve carregar e renderizar os dados com sucesso', async () => {
    const mockData: ExameHistory[] = [
      {
        id: 'EX-1111-2222',
        nomeCompleto: 'João Silva',
        olho: 'AO' as any,
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
      isFetched: true,
      refetch: mockRefetch,
    } as any);

    renderComponent();

    expect(await screen.findByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('EX-1111-2222')).toBeInTheDocument();
  });

  it('deve lidar com erro de carregamento e renderizar a tela de erro', async () => {
      vi.mocked(useGetExamsHook.useGetExams).mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
        isFetching: false,
        isFetched: true,
        refetch: mockRefetch,
      } as any);

      renderComponent();

      // Valida que a página tratou o erro exibindo o feedback visual correto ao usuário
      expect(
        await screen.findByText(/não foi possível carregar os exames/i)
      ).toBeInTheDocument();
    });
  it('deve mostrar estado vazio quando não houver exames', async () => {
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
        total: 0,
        page: 1,
        totalPages: 1,
      },
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
});