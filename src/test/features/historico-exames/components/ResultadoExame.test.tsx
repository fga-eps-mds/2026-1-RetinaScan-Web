// src/test/features/historico-exames/components/ResultadoExame.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';
import * as useGetResultadoExameHook from '@/features/historico-exames/routes/../hooks/useGetResultadoExame';
import * as useExamLockHook from '@/features/historico-exames/routes/../hooks/useExamLock';

vi.mock('@/features/historico-exames/hooks/useGetResultadoExame', () => ({
  useGetResultadoExame: vi.fn(),
}));

vi.mock('@/features/historico-exames/hooks/useExamLock', () => ({
  useExamLock: vi.fn(),
}));

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
  CardLaudo: ({ onSubmit }: { onSubmit: (val: any) => void }) => (
    <div data-testid="card-laudo-mock">
      <button 
        type="button"
        data-testid="btn-submit-laudo"
        onClick={() => onSubmit({ texto: 'Texto do especialista', html: '<p>Laudo</p>', json: {}, resultadoIaValido: true })}
      >
        Submeter
      </button>
    </div>
  ),
  default: () => <div data-testid="card-laudo-mock" />,
}));

vi.mock('@/features/historico-exames/components/CardLaudoVisualizacao', () => ({
  CardLaudoVisualizacao: () => <div data-testid="card-laudo-visualizacao-mock" />,
  default: () => <div data-testid="card-laudo-visualizacao-mock" />,
}));

const mockMutateCreate = vi.fn().mockResolvedValue({});
vi.mock('@/features/historico-exames/hooks/useCreateSpecialistReport', () => ({
  useCreateSpecialistReport: () => ({ mutateAsync: mockMutateCreate, isPending: false }),
}));

const mockMutateUpdate = vi.fn().mockResolvedValue({});
vi.mock('@/features/historico-exames/hooks/useUpdateSpecialistReport', () => ({
  useUpdateSpecialistReport: () => ({ mutateAsync: mockMutateUpdate, isPending: false }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: 'usr-sp', tipoPerfil: 'ESPECIALISTA' } },
      isPending: false,
    }),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ResultadoExame - Cobertura Estrutural', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Fixa o Date.now do JavaScript de forma atômica
    const fixedTimestamp = new Date('2026-05-20T12:00:00.000Z').getTime();
    vi.spyOn(globalThis.Date, 'now').mockImplementation(() => fixedTimestamp);

    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    
    vi.mocked(useExamLockHook.useExamLock).mockReturnValue({
      lockState: { status: 'editor' },
      sessionId: 'sess-123',
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

  it('deve cobrir fluxo de criação e envio de laudo com sucesso', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useGetResultadoExameHook.useGetResultadoExame).mockReturnValue({
      data: {
        exam: { id: 'EX-2026-0036', status: 'CONCLUIDO', laudoEspecialista: null },
        imagens: [],
      },
      isLoading: false, isError: false, isFetching: false, refetch: mockRefetch,
    } as any);

    renderComponent();

    expect(await screen.findByText('Editando agora')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('btn-submit-laudo'));

    await waitFor(() => {
      expect(mockMutateCreate).toHaveBeenCalled();
    });
  });

  it('deve cobrir o fluxo quando o laudo já existe e a tela está bloqueada/concorrente por outro médico', async () => {
    // Forçamos a criação do laudo para acontecer no FUTURO (ex: ano 2035).
    // mesmo se a variável de ambiente injetada falhar e assumir 0 dias de prazo.
    const dataCriacaoValida = '2035-01-01T12:00:00.000Z';

    vi.mocked(useGetResultadoExameHook.useGetResultadoExame).mockReturnValue({
      data: {
        exam: {
          id: 'EX-2026-0036',
          status: 'CONCLUIDO',
          laudoEspecialista: {
            id: 'rep-1',
            specialistId: 'usr-sp',
            texto: 'Laudo antigo',
            html: '<p>Laudo antigo</p>',
            conteudo: '{}',
            createdAt: dataCriacaoValida, 
            specialist: { nomeCompleto: 'Dr. Gregory House' }
          }
        },
        imagens: [],
      },
      isLoading: false, isError: false, isFetching: false, refetch: vi.fn(),
    } as any);

    vi.mocked(useExamLockHook.useExamLock).mockReturnValue({
      lockState: { status: 'blocked', editorNome: 'Dr. Arthur Pendelton' },
      sessionId: 'sess-abc',
    });

    renderComponent();

    // Como o laudo não cai na branch de expirado, as travas de concorrência são montadas no HTML com sucesso!
    expect(await screen.findByText('Em edição por Dr. Arthur Pendelton')).toBeInTheDocument();
    expect(await screen.findByText(/Laudo registrado por Dr. Gregory House/i)).toBeInTheDocument();
    expect(await screen.findByText(/Este laudo está sendo editado por Dr. Arthur Pendelton/i)).toBeInTheDocument();
  });
});