
// 1. DTOs (Data Transfer Objects) - O reflexo exato do payload do Backend

export type ExamStatus =
  | 'CRIADO'
  | 'CONCLUIDO'
  | 'EM_PROCESSAMENTO'
  | 'ERRO_PROCESSAMENTO';

export interface VolumeMetricsDTO {
  total: number;
  porStatus: Record<ExamStatus, number>;
  serieTemporal: { data: string; total: number }[];
}

export interface IaResultsMetricsDTO {
  totalResultados: number;
  porDiagnostico: { label: string; total: number }[];
  confiancaMedia: number;
}

export interface BackendMetricsResponseDTO {
  volume: VolumeMetricsDTO;
  resultadosIa: IaResultsMetricsDTO;
}


// 2. View Models - O formato que a Interface (UI) consome


export interface DashboardMetrics {
  analisesTotais: { total: number; periodoDias: number };
  indicacaoEspecialista: { total: number; porcentagem: number };
  resultadosNormais: { total: number; porcentagem: number };
  pendentes: { total: number };
  errosProcessamento: { total: number };
  confiancaIa: { media: number };
}

export type DashboardExamStatusTag = 'PRIORIDADE' | 'NORMAL' | 'PENDENTE';


// 3. Tipagem de Listagens (Tabelas/Listas de Exames)


export interface RecentExamItem {
  id: string;
  pacienteId: string;
  olho: string;
  scoreIa: string | null;
  statusTag: DashboardExamStatusTag;
  dataExame: string;
  status: ExamStatus; // Permite que a UI saiba exatamente em qual etapa o exame parou (incluindo ERRO_PROCESSAMENTO)
}


// 4. Filtros de Requisição
export interface GetMetricsFilters {
  startDate?: string;
  endDate?: string;
}