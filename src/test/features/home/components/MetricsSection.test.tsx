import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsSection } from '@/features/home/components/MetricSection';
import type { DashboardMetrics } from '@/features/home/types/dashboard-result';

describe('MetricsSection', () => {
  const mockMetrics: DashboardMetrics = {
    analisesTotais: { total: 500, periodoDias: 30 },
    indicacaoEspecialista: { total: 50, porcentagem: 10 },
    resultadosNormais: { total: 450, porcentagem: 90 },
    pendentes: { total: 15 },
    errosProcessamento: { total: 3 },
    confiancaIa: { media: 98 },
  };

  it('deve renderizar todos os 6 cards de métricas com os títulos corretos', () => {
    render(<MetricsSection metrics={mockMetrics} />);

    // Atualizado com os títulos exatos definidos no componente MetricsSection
    expect(screen.getByText('Totais de Exames')).toBeInTheDocument();
    expect(screen.getByText('Com alteração na retina')).toBeInTheDocument();
    expect(screen.getByText('Sem alteração na retina')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Falhas na IA')).toBeInTheDocument();
    expect(screen.getByText('Confiança IA')).toBeInTheDocument();
  });

  it('deve formatar e exibir os valores numéricos e subtítulos corretamente com base nas props', () => {
    render(<MetricsSection metrics={mockMetrics} />);

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 dias')).toBeInTheDocument();

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('10% do total')).toBeInTheDocument();

    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('90% do total')).toBeInTheDocument();

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Esperando análise')).toBeInTheDocument();

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Requerem atenção')).toBeInTheDocument();

    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.getByText('Acurácia média (%)')).toBeInTheDocument();
  });
});