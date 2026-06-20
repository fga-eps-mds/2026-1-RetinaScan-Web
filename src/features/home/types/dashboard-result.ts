export type DashboardMetrics = {
  analisesTotais: {
    total: number;
    periodoDias: number; 
  };
  indicacaoEspecialista: {
    total: number;
    porcentagem: number; 
  };
  resultadosNormais: {
    total: number;
    porcentagem: number; 
  };
  pendentes: {
    total: number;
  };
};

export type DashboardExamStatusTag = 'PRIORIDADE' | 'NORMAL' | 'PENDENTE';
export type Olho = 'AO' | 'OD' | 'OE' | null;

export type RecentExamItem = {
  id: string;          
  pacienteID: string; 
  olho?: Olho;  
  scoreIA: string | null; 
  statusTag: DashboardExamStatusTag;
  dataExame: string;     
};


// o que a api retorna para a tela inicial do dashboard
export interface DashboardResult {
  metrics: DashboardMetrics;
  recentExams: RecentExamItem[];
}