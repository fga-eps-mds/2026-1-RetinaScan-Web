// src/test/features/historico-exames/components/ResultadoExame.test.tsx
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import ResultadoExame from '@/features/historico-exames/routes/ResultadoExame';

// Mock react-router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

// CORREÇÃO: Usando o caminho absoluto do alias (@/) para garantir que o Vitest ache o hook e injete o mock
vi.mock('@/features/historico-exames/hooks/useGetResultadoExame', () => ({
  useGetResultadoExame: (id: string) => ({
    data: {
      exam: { 
        id: id, 
        comorbidades: [],
        medico: {
          nomeCompleto: 'Dr. Silva Sauro',
        },
        paciente: {
          nomeCompleto: 'Paciente Teste da Silva',
        }
      },
      imagens: [],
    },
    isLoading: false,
    isError: false,
    isFetching: false,
  }),
}));

// Mocks complementares neutros para os subcomponentes internos de Lock
vi.mock('@/features/historico-exames/hooks/useExamLock', () => ({
  useExamLock: () => ({
    lockState: { status: 'editor' },
    sessionId: 'mocked-session-id',
  }),
}));

vi.mock('@/features/historico-exames/hooks/useExamEditingLocks', () => ({
  useExamEditingLocks: () => ({
    data: {},
    isLoading: false,
  }),
}));

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
        <MemoryRouter>
          <ResultadoExame />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Agora o ID e as informações complementares renderizam sem ficar travado em loading
    expect(screen.getByText(/Exame 1/i)).toBeInTheDocument();
    
    // Verifica a existência do botão principal de ação
    expect(screen.getByText('Baixar Laudo')).toBeInTheDocument();
  });
});