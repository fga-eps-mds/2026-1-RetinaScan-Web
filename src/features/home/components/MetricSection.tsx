import React from 'react';
import { MetricCard } from './MetricCard';
import type { DashboardMetrics } from '../types/dashboard-result';

interface MetricsSectionProps {
  metrics: DashboardMetrics;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full p-8">
      <MetricCard
        title="Análises Totais"
        value={metrics.analisesTotais.total}
        subtext={`Últimos ${metrics.analisesTotais.periodoDias} dias`}
        variant="default"
      />
      <MetricCard
        title="Indicação a Especialista"
        value={metrics.indicacaoEspecialista.total}
        subtext={`${metrics.indicacaoEspecialista.porcentagem}% do total`}
        variant="danger"
      />
      <MetricCard
        title="Resultados Normais"
        value={metrics.resultadosNormais.total}
        subtext={`${metrics.resultadosNormais.porcentagem}% do total`}
        variant="success"
      />
      <MetricCard
        title="Pendentes"
        value={metrics.pendentes.total}
        subtext="Esperando análise"
        variant="info"
      />
    </div>
  );
};