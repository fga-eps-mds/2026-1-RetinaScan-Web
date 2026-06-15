import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { MemoryRouter, Route, Routes } from 'react-router';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';

// 1. Mock do hook de busca de dados
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
      },
      imagens: [],
      resultadosIa: [],
    },
    isLoading: false,
    isError: false,
  }),
}));

// 2. Mocks dos subcomponentes (Garantindo suporte a exportações nomeadas ou default)
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

// 3. Mocks neutros dos hooks do laudo para não exigirem contexto extra
vi.mock('@/features/historico-exames/hooks/useExamLock', () => ({
  useExamLock: () => ({
    lockState: { status: 'editor' },
    sessionId: 'mocked-session',
  }),
}));

vi.mock('@/features/historico-exames/hooks/useExamEditingLocks', () => ({
  useExamEditingLocks: () => ({
    data: {},
    isLoading: false,
  }),
}));

// 4. Mock do novo hook de download
vi.mock('@/features/historico-exames/hooks/useDownloadLaudo', () => ({
  useDownloadLaudo: () => ({
    handleDownload: vi.fn(),
    isDownloading: false,
  }),
}));

// Instanciação do cliente de teste isolado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('ResultadoExame', () => {
  it('renderiza o cabeçalho, as ações principais e os cards da tela', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/exames/EX-2026-0036']}>
          <Routes>
            <Route path="/exames/:id" element={<ResultadoExame />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Validações textuais e de acessibilidade (Ajustado regex para bater com o título)
    expect(screen.getByRole('heading', { name: /ex-2026-0036/i })).toBeInTheDocument();
    expect(screen.getByText('Detalhes e resultado do exame')).toBeInTheDocument();
    
    // ATUALIZADO: O texto do botão agora é "Baixar Relatório"
    expect(screen.getByRole('button', { name: /baixar relatório/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument();
    
    // Validações dos mocks injetados
    expect(screen.getByTestId('card-imagens-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-resultado-mock')).toBeInTheDocument();
    expect(screen.getByTestId('card-detalhes-mock')).toBeInTheDocument();
  });
});