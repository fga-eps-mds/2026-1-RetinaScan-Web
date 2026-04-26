export type Solicitacao = {
  id: number;
  idUsuario: string;
  cpfNovo: string;
  crmNovo: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  motivoRejeicao?: string;
  analisadoPor: null;
  analisadoEm: null;
  createdAt: string;
  updatedAt: string;
};
