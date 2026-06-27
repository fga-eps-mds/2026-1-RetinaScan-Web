import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

import { AdminDashboard } from '@/features/home/components/admin/AdminDashboard';
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

// 2. Mock de componentes visuais filhos para focar apenas na lógica da tela principal
vi.mock('@/features/home/components/TimeSeriesChart', () => ({
  TimeSeriesChart: () => <div data-testid="time-series-chart" />
}));

vi.mock('@/features/home/components/MetricSection', () => ({
  MetricsSection: () => <div data-testid="metrics-section" />
}));

vi.mock('@/features/home/components/DashboardDateFilters', () => ({
  DashboardDateFilters: () => <div data-testid="dashboard-date-filters" />
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuração padrão de sessão para evitar erros de renderização
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { name: 'João Admin', tipoPerfil: 'ADMIN' } },
      isPending: false,
      error: null,
    } as any);
  });

  it('deve exibir o layout de carregamento (Loader) quando isLoading for true', () => {
    // Arrange: Simula a API carregando
    vi.mocked(useGetMetrics).mockReturnValue({
      isLoading: true,
      isFetching: false,
      isError: false,
      data: undefined,
      error: null,
    } as any);

    // Act
    render(<AdminDashboard />);

    // Assert
    expect(screen.getByText('Carregando métricas...')).toBeInTheDocument();
    expect(screen.queryByTestId('metrics-section')).not.toBeInTheDocument();
  });

  it('deve exibir a mensagem de erro crítico e disparar um toast em caso de falha da API', () => {
    // Arrange: Simula um erro de servidor vindo da API
    const mockError = {
      response: { data: { message: 'Erro interno no servidor' } }
    };

    vi.mocked(useGetMetrics).mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: true,
      data: undefined,
      error: mockError,
    } as any);

    // Act
    render(<AdminDashboard />);

    // Assert
    expect(screen.getByText('Erro crítico ao carregar os dados.')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Erro interno no servidor');
  });

  it('deve renderizar as métricas e o gráfico quando a API retornar sucesso', () => {
    // Arrange: Simula dados retornados com sucesso
    const mockData = {
      volume: { 
        total: 150, 
        // 👇 ADICIONADO AQUI: Mock do status para evitar o erro undefined
        porStatus: {
          CRIADO: 10,
          EM_PROCESSAMENTO: 5,
        },
        serieTemporal: [{ data: '2026-06-01', total: 5 }] 
      },
      resultadosIa: { totalResultados: 150, porDiagnostico: [] }
    };

    vi.mocked(useGetMetrics).mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: mockData,
      error: null,
    } as any);

    // Act
    render(<AdminDashboard />);

    // Assert: Garante que os filhos foram montados no DOM (usando nossos mocks)
    expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-date-filters')).toBeInTheDocument();
    expect(screen.getByTestId('time-series-chart')).toBeInTheDocument();
  });
});