// src/test/features/historico-exames/components/ResultadoExame.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';
import * as useGetResultadoExameHook from '@/features/historico-exames/hooks/useGetResultadoExame';

// 1. Mock do hook de busca de dados
vi.mock('@/features/historico-exames/hooks/useGetResultadoExame', () => ({
  useGetResultadoExame: vi.fn(),
}));

// 2. Mocks dos subcomponentes estruturais para isolar o teste
vi.mock('@/features/historico-exames/components/CardImagens', () => ({
  CardImagens: () => <div data-testid="card-imagens-mock" />,
  default: () => <div data-testid="card-imagens-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardResultado', () => ({
  CardResultado: () => <div data-testid="card-resultado-mock" />,
  default: () => <div data-testid="card-resultado-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardDetalhes', () => ({
  CardDetalhes: () => <div data-testid="card-detalhes-mock" />,
  default: () => <div data-testid="card-detalhes-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardComorbidades', () => ({
  CardComorbidades: () => <div data-testid="card-comorbidades-mock" />,
  default: () => <div data-testid="card-comorbidades-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardLaudo', () => ({
  CardLaudo: () => <div data-testid="card-laudo-mock" />,
  default: () => <div data-testid="card-laudo-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardLaudoVisualizacao', () => ({
  CardLaudoVisualizacao: () => <div data-testid="card-laudo-visualizacao-mock" />,
  default: () => <div data-testid="card-laudo-visualizacao-mock" />,
}));

// 3. Mocks de infraestrutura (Lock e Auth)
vi.mock('@/features/historico-exames/hooks/useExamLock', () => ({
  useExamLock: () => ({
    lockState: { status: 'editor' },
    sessionId: 'mocked-session',
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: 'usr-sp', tipoPerfil: 'ESPECIALISTA' } },
      isPending: false,
    }),
  },
}));

describe('ResultadoExame', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/exames/EX-2026-0036']}>
          <Routes>
            <Route path="/exames/:id" element={<ResultadoExame />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('deve renderizar o cabeçalho, as ações principais e os cards no estado de sucesso', async () => {
    vi.mocked(useGetResultadoExameHook.useGetResultadoExame).mockReturnValue({
      data: {
        exam: {
          id: 'EX-2026-0036',
          status: 'CONCLUIDO',
          laudoEspecialista: null, // Simula cenário sem laudo pré-existente
        },
        imagens: [],
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    // Validações do cabeçalho e botões
    expect(screen.getByRole('heading', { name: /exame ex-2026-0036/i })).toBeInTheDocument();
    expect(screen.getByText('Detalhes e resultado do exame')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar laudo/i })).toBeInTheDocument();
    
    // Valida se as ramificações dos novos subcomponentes foram executadas
    expect(screen.getByTestId('card-imagens-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-resultado-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-detalhes-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-comorbidades-mock')).toBeInTheDocument();
    
    // Valida a badge e o card de criação de laudo ativo (ramificação do Especialista)
    expect(screen.getByText('Editando agora')).toBeInTheDocument();
    expect(screen.getByTestId('card-laudo-mock')).toBeInTheDocument();
  });

  it('deve exibir feedback de erro caso a query falhe', () => {
    vi.mocked(useGetResultadoExameHook.useGetResultadoExame).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText(/não foi possível carregar o resultado do exame/i)).toBeInTheDocument();
  });
});