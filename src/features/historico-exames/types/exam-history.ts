export type StatusExame = 'Prioridade' | 'Normal' | 'Pendente';

export interface ExameHistory {
  id: string;
  nomeCompleto: string;
  olho: 'AO' | 'OD';
  scoreIA: string | null;
  status: StatusExame;
  dtCriacao: string;
}
