import type { DashboardMetrics } from '../../features/home/types/dashboard-result';

export const mapDashboardMetrics = (apiMetrics: any): DashboardMetrics => {
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

  const getDiagnostico = (label: string) => 
    apiMetrics.resultadosIa.porDiagnostico.find((d: any) => d.label === label)?.total || 0;

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