import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

import { MedicoDashboard } from '@/features/home/components/medico/MedicoDashboard';
import { useGetMetrics } from '@/features/home/hooks/useGetMetrics';
import { authClient } from '@/lib/auth-client';

// 1. Mock das bibliotecas de UI e dependências externas
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@/features/home/hooks/useGetMetrics', () => ({
  useGetMetrics: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

// 2. Mock de componentes visuais filhos com caminhos absolutos
vi.mock('@/features/home/components/TimeSeriesChart', () => ({
  TimeSeriesChart: () => <div data-testid="time-series-chart" />
}));

vi.mock('@/features/home/components/MetricSection', () => ({
  MetricsSection: () => <div data-testid="metrics-section" />
}));

vi.mock('@/features/home/components/DashboardDateFilters', () => ({
  DashboardDateFilters: () => <div data-testid="dashboard-date-filters" />
}));

describe('MedicoDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { name: 'Dr. Roberto', tipoPerfil: 'MEDICO' } },
      isPending: false,
      error: null,
    } as any);
  });

  it('deve exibir o layout de carregamento (Loader) quando isLoading for true', () => {
    vi.mocked(useGetMetrics).mockReturnValue({
      isLoading: true,
      isFetching: false,
      isError: false,
      data: undefined,
      error: null,
    } as any);

    render(<MedicoDashboard />);

    expect(screen.getByText('Carregando seus exames...')).toBeInTheDocument();
    expect(screen.queryByTestId('metrics-section')).not.toBeInTheDocument();
  });

  it('deve exibir a mensagem de erro e disparar um toast em caso de falha da API', () => {
    const mockError = {
      response: { data: { message: 'Erro ao processar as métricas do médico' } }
    };

    vi.mocked(useGetMetrics).mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: true,
      data: undefined,
      error: mockError,
    } as any);

    render(<MedicoDashboard />);

    expect(screen.getByText('Erro ao carregar os dados.')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Erro ao processar as métricas do médico');
  });

  it('deve renderizar as métricas e o gráfico quando a API retornar sucesso', () => {
    const mockData = {
      volume: { 
        total: 25, 
        porStatus: {
          CRIADO: 10,
          EM_PROCESSAMENTO: 5,
        },
        serieTemporal: [{ data: '2026-06-01', total: 5 }] 
      },
      resultadosIa: { totalResultados: 25, porDiagnostico: [] }
    };

    vi.mocked(useGetMetrics).mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: mockData,
      error: null,
    } as any);

    render(<MedicoDashboard />);

    expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-date-filters')).toBeInTheDocument();
    expect(screen.getByTestId('time-series-chart')).toBeInTheDocument();
  });
});