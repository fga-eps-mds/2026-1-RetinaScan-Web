import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { MemoryRouter, Route, Routes } from 'react-router';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';

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

// 2. Mock do hook de busca de dados do exame
vi.mock('@/features/historico-exames/hooks/useGetResultadoExame', () => ({
  useGetResultadoExame: () => ({
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
        laudoEspecialista: null, // Sem laudo para mostrar o estado inicial
      },
      imagens: [],
      resultadosIa: [],
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

// 3. Mocks das Features de Lock e Laudos
vi.mock('@/features/historico-exames/hooks/useExamLock', () => ({
  useExamLock: () => ({
    lockState: { status: 'editor' },
  }),
}));

vi.mock('@/features/historico-exames/hooks/useCreateSpecialistReport', () => ({
  useCreateSpecialistReport: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/features/historico-exames/hooks/useUpdateSpecialistReport', () => ({
  useUpdateSpecialistReport: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// 4. Mocks dos subcomponentes (Isolando a renderização)
vi.mock('@/features/historico-exames/components/CardImagens', () => ({ CardImagens: () => <div data-testid="card-imagens-mock" /> }));
vi.mock('@/features/historico-exames/components/CardResultado', () => ({ CardResultado: () => <div data-testid="card-resultado-mock" /> }));
vi.mock('@/features/historico-exames/components/CardDetalhes', () => ({ CardDetalhes: () => <div data-testid="card-detalhes-mock" /> }));
vi.mock('@/features/historico-exames/components/CardComorbidades', () => ({ CardComorbidades: () => <div data-testid="card-comorbidades-mock" /> }));
vi.mock('@/features/historico-exames/components/CardLaudo', () => ({ CardLaudo: () => <div data-testid="card-laudo-mock" /> }));
vi.mock('@/features/historico-exames/components/CardLaudoVisualizacao', () => ({ CardLaudoVisualizacao: () => <div data-testid="card-laudo-visualizacao-mock" /> }));

// Instanciação do cliente de teste
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('ResultadoExame', () => {
  it('renderiza o cabeçalho, as ações principais e os cards da tela corretamente', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/exames/EX-2026-0036']}>
          <Routes>
            <Route path="/exames/:id" element={<ResultadoExame />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Validações Textuais do Cabeçalho
    expect(screen.getByRole('heading', { name: /ex-2026-0036/i })).toBeInTheDocument();
    expect(screen.getByText('Detalhes e resultado do exame')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar laudo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument();
    
    // Verifica se a badge de "Editando agora" apareceu (baseado no mock de 'isEditor')
    expect(screen.getByText('Editando agora')).toBeInTheDocument();

    // Validações de renderização dos Mocks (Garante que o layout estrutural funcionou)
    expect(screen.getByTestId('card-imagens-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-resultado-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-detalhes-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-comorbidades-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-laudo-mock')).toBeInTheDocument();
  });
});