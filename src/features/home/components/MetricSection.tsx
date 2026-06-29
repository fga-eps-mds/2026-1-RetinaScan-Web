import React from 'react';
import { MetricCard } from './MetricCard';
import type { DashboardMetrics } from '../types/dashboard-result';

interface MetricsSectionProps {
  metrics: DashboardMetrics;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 w-full p-8">
      <MetricCard
        title="Totais de Exames"
        value={metrics.analisesTotais.total}
        subtext={`Últimos ${metrics.analisesTotais.periodoDias} dias`}
        variant="default"
      />
      
      {/* Casos anormais que requerem atenção médica */}
      <MetricCard
        title="Com alteração na retina"
        value={metrics.indicacaoEspecialista.total}
        subtext={`${metrics.indicacaoEspecialista.porcentagem}% do total`}
        variant="warning"
        tooltipInfo="Contabiliza as retinas individuais processadas. Um exame com imagens de ambos os olhos equivale a 2 análises da IA."
      />
      
      {/* Casos saudáveis/normais */}
      <MetricCard
        title="Sem alteração na retina"
        value={metrics.resultadosNormais.total}
        subtext={`${metrics.resultadosNormais.porcentagem}% do total`}
        variant="success"
        tooltipInfo="Contabiliza as retinas individuais processadas. Um exame com imagens de ambos os olhos equivale a 2 análises da IA."
      />
      
      {/* Exames aguardando processamento da IA */}
      <MetricCard
        title="Pendentes"
        value={metrics.pendentes.total}
        subtext="Esperando análise"
        variant="info"
      />
      
      {/* Erros sistêmicos */}
      <MetricCard
        title="Falhas na IA"
        value={metrics.errosProcessamento.total}
        subtext="Requerem atenção"
        variant="danger"
      />
      
      <MetricCard
        title="Confiança IA"
        value={metrics.confiancaIa.media}
        subtext="Acurácia média (%)"
        variant="default"
      />
    </div>
  );
};