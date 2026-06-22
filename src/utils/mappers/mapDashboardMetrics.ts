import type { DashboardMetrics, BackendMetricsResponseDTO } from '../../features/home/types/dashboard-result';

export const mapDashboardMetrics = (apiMetrics?: BackendMetricsResponseDTO | null): DashboardMetrics => {
  // Guard clause: Estado vazio/zerado se não houver payload
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

  // Desestruturação com fallbacks para evitar erros caso a API envie um payload parcial
  const porDiagnostico = apiMetrics.resultadosIa?.porDiagnostico || [];
  const porStatus = apiMetrics.volume?.porStatus || {};

  // Busca o diagnóstico com toLowerCase() para blindar contra diferenças de formatação do backend
  const getDiagnostico = (targetLabel: string) => 
    porDiagnostico.find((d) => d.label?.toLowerCase() === targetLabel.toLowerCase())?.total || 0;

  // Evita divisão por zero retornando 1 caso o total seja 0 (o resultado final da % ainda será 0)
  const totalIa = apiMetrics.resultadosIa?.totalResultados || 1; 
  const normais = getDiagnostico('normal');
  const anormais = getDiagnostico('abnormal');

  const totalPendentes = (porStatus.CRIADO || 0) + (porStatus.EM_PROCESSAMENTO || 0);

  return {
    analisesTotais: { 
      total: apiMetrics.volume?.total || 0, 
      periodoDias: 30 
    },
    indicacaoEspecialista: { 
      total: anormais, 
      porcentagem: Math.round((anormais / totalIa) * 100) 
    },
    resultadosNormais: { 
      total: normais, 
      porcentagem: Math.round((normais / totalIa) * 100) 
    },
    pendentes: { 
      total: totalPendentes 
    },
    errosProcessamento: { 
      total: porStatus.ERRO_PROCESSAMENTO || 0 
    },
    confiancaIa: { 
      media: Math.round((apiMetrics.resultadosIa?.confiancaMedia || 0) * 100) 
    }
  };
};