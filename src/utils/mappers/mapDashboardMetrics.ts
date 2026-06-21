import type { DashboardMetrics } from '../../features/home/types/dashboard-result';

// Tipagem do retorno esperado da sua API de métricas
export interface ApiDashboardMetrics {
  volume: {
    total: number;
    porStatus: {
      CRIADO?: number;
      EM_PROCESSAMENTO?: number;
      ERRO_PROCESSAMENTO?: number;
      CONCLUIDO?: number;
    };
  };
  resultadosIa: {
    totalResultados: number;
    confiancaMedia: number;
    porDiagnostico: Array<{
      label: string;
      total: number;
    }>;
  };
}

// Substituímos o 'any' por 'ApiDashboardMetrics | undefined | null'
export const mapDashboardMetrics = (apiMetrics?: ApiDashboardMetrics | null): DashboardMetrics => {
  if (!apiMetrics) {
    return {
      analisesTotais: { total: 0, periodoDias: 30 },
      indicacaoEspecialista: { total: 0, porcentagem: 0 },
      resultadosNormais: { total: 0, porcentagem: 0 },
      pendentes: { total: 0 },
      errosProcessamento: { total: 0 },
      confiancaIa: { media: 0 },
    };
  }

  // A inferência do TypeScript já sabe o que é o 'd' porque tipamos o 'porDiagnostico', 
  // mas podemos tipar explicitamente para evitar qualquer erro de lint
  const getDiagnostico = (label: string) => 
    apiMetrics.resultadosIa.porDiagnostico.find((d: { label: string; total: number }) => d.label === label)?.total || 0;

  const totalIa = apiMetrics.resultadosIa.totalResultados || 1; 
  const normais = getDiagnostico('normal');
  const anormais = getDiagnostico('abnormal');

  const totalPendentes = 
    (apiMetrics.volume.porStatus.CRIADO || 0) + 
    (apiMetrics.volume.porStatus.EM_PROCESSAMENTO || 0);

  return {
    analisesTotais: { total: apiMetrics.volume.total, periodoDias: 30 },
    indicacaoEspecialista: { total: anormais, porcentagem: Math.round((anormais / totalIa) * 100) },
    resultadosNormais: { total: normais, porcentagem: Math.round((normais / totalIa) * 100) },
    pendentes: { total: totalPendentes },
    errosProcessamento: { total: apiMetrics.volume.porStatus.ERRO_PROCESSAMENTO || 0 },
    confiancaIa: { media: Math.round((apiMetrics.resultadosIa.confiancaMedia || 0) * 100) }
  };
};