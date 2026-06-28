import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';

import { useGetResultadoExame } from '@/features/historico-exames/hooks/useGetResultadoExame';

// ============================================================================
// MOCKS E SIMULAÇÕES
// ============================================================================

// 1. Mock do Auth Client (Sessão do Usuário)
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: {
          id: 'USR-123',
          tipoPerfil: 'ESPECIALISTA',
        },
      },
      isPending: false,
    }),
  },
}));

// 2. Mock do hook principal de busca de dados (useGetResultadoExame)
vi.mock('@/features/historico-exames/hooks/useGetResultadoExame', () => ({
  useGetResultadoExame: vi.fn(),
}));

// 3. Mocks das Features de Negócio (Lock, Laudos e Downloads)
// -> Simula o sistema de bloqueio de edição simultânea
vi.mock('@/features/historico-exames/hooks/useExamLock', () => ({
  useExamLock: () => ({
    lockState: { status: 'editor' },
  }),
}));

// -> Simula as chamadas de POST para criar um novo laudo
vi.mock('@/features/historico-exames/hooks/useCreateSpecialistReport', () => ({
  useCreateSpecialistReport: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// -> Simula as chamadas de PUT para atualizar um laudo existente
vi.mock('@/features/historico-exames/hooks/useUpdateSpecialistReport', () => ({
  useUpdateSpecialistReport: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// -> Impede o acionamento da janela de download de PDF durante o teste
vi.mock('@/features/historico-exames/hooks/useDownloadLaudo', () => ({
  useDownloadLaudo: () => ({
    handleDownload: vi.fn(),
    isDownloading: false,
  }),
}));

// 4. Mocks dos Subcomponentes Visuais (Shallow Rendering)
vi.mock('@/features/historico-exames/components/CardImagens', () => ({
  CardImagens: () => <div data-testid="card-imagens-mock" />,
}));
vi.mock('@/features/historico-exames/components/CardResultado', () => ({
  CardResultado: () => <div data-testid="card-resultado-mock" />,
}));
vi.mock('@/features/historico-exames/components/CardDetalhes', () => ({
  CardDetalhes: () => <div data-testid="card-detalhes-mock" />,
}));
vi.mock('@/features/historico-exames/components/CardComorbidades', () => ({
  CardComorbidades: () => <div data-testid="card-comorbidades-mock" />,
}));
vi.mock('@/features/historico-exames/components/CardLaudo', () => ({
  CardLaudo: () => <div data-testid="card-laudo-mock" />,
}));
vi.mock('@/features/historico-exames/components/CardLaudoVisualizacao', () => ({
  CardLaudoVisualizacao: () => (
    <div data-testid="card-laudo-visualizacao-mock" />
  ),
}));

// ============================================================================
// CONFIGURAÇÃO DOS TESTES
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderResultadoExame = () => {
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

describe('ResultadoExame', () => {
  // Antes de cada bloco 'it', definimos a reposta padrão da API como "Sucesso".
  beforeEach(() => {
    vi.mocked(useGetResultadoExame).mockReturnValue({
      data: {
        exam: {
          id: 'EX-2026-0036',
          idUsuario: 'USR-001',
          nomeCompleto: 'João da Silva',
          cpf: '123.456.789-00',
          sexo: 'MASCULINO',
          dtNascimento: '1990-01-01',
          dtHora: '2026-05-22T10:30:00Z',
          status: 'CONCLUIDO',
          olho: 'OD',
          comorbidades: [],
          laudoEspecialista: null,
          medico: {
            id: 'USR-123',
          },
        },
        imagens: [],
        resultadosIa: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renderiza o cabeçalho, as ações principais e os cards da tela corretamente', () => {
    renderResultadoExame();

    expect(
      screen.getByRole('heading', { name: /ex-2026-0036/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Detalhes e resultado do exame')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /baixar relatório/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /compartilhar/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Editando agora')).toBeInTheDocument();

    expect(screen.getByTestId('card-imagens-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-resultado-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-detalhes-mock')).toBeInTheDocument();
  });

  it('exibe tela de "Erro ao carregar" quando ocorre um erro genérico', () => {
    // Sobrescrevemos o mock para simular uma falha (como erro de conexão) sem status 403
    vi.mocked(useGetResultadoExame).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Erro de conexão'),
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderResultadoExame();

    expect(
      screen.getByRole('heading', { name: /erro ao carregar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Não foi possível carregar o resultado do exame no momento.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /voltar para meus exames/i })
    ).toBeInTheDocument();
  });

  it('exibe tela de "Acesso Indisponível" quando a API retorna erro 403', () => {
    // Sobrescrevemos o mock para simular o bloqueio de permissão que enviamos do backend
    vi.mocked(useGetResultadoExame).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 403 } },
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    renderResultadoExame();

    expect(
      screen.getByRole('heading', { name: /acesso indisponível/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/você não possui permissão para visualizar este exame/i)
    ).toBeInTheDocument();
  });
});
