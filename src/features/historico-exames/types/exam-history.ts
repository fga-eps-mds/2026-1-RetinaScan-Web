export type StatusExame = 'Prioridade' | 'Normal' | 'Pendente';
export type TipoOlho = 'Ambos' | 'Esquerdo' | 'Direito';

export interface ExameHistory {
  idExame: string;
  nomePaciente: string;       
  olho: TipoOlho;       
  scoreIA: string | null; 
  status: StatusExame;    
  data: string;           
}