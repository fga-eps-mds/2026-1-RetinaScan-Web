// Tipagem para os dados que vêm do backend
export type ExameStatus =
  | 'CRIADO'
  | 'CONCLUIDO'
  | 'EM_PROCESSAMENTO'
  | 'ERRO_PROCESSAMENTO';

export interface ExamVolumeMetrics {
  total: number;
  porStatus: Record<ExameStatus, number>;
  serieTemporal: { data: string; total: number }[];
}

export interface DiagnosisMetrics {
  totalResultados: number;
  porDiagnostico: { label: string; total: number }[];
  confiancaMedia: number;
}

export interface BackendMetricsResponse {
  volume: ExamVolumeMetrics;
  resultadosIa: DiagnosisMetrics;
}

// Tipagem que a sua UI (MetricsSection) espera
export interface DashboardMetrics {
  analisesTotais: { total: number; periodoDias: number };
  indicacaoEspecialista: { total: number; porcentagem: number };
  resultadosNormais: { total: number; porcentagem: number };
  pendentes: { total: number };
  errosProcessamento: { total: number };
  confiancaIa: { media: number };
}

export type DashboardExamStatusTag = 'PRIORIDADE' | 'NORMAL' | 'PENDENTE';

export interface RecentExamItem {
  id: string;
  pacienteID: string;
  olho: string;
  scoreIA: string | null;
  statusTag: DashboardExamStatusTag;
  dataExame: string;
  errosProcessamento: { total: number };

}

export interface GetMetricsFilters {
  startDate?: string;
  endDate?: string;
}
