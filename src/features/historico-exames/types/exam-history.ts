export type StatusExame = 'Prioridade' | 'Normal' | 'Pendente';
export type TipoOlho = 'Ambos' | 'Esquerdo' | 'Direito';

export interface ExameHistory {
  id: string;             
  paciente: string;       
  olho: TipoOlho;       
  scoreIA: number | null; 
  status: StatusExame;    
  data: string;           
}