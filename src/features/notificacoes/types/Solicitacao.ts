export type Solicitacao = {
  id: number;
  idUsuario: string;
  cpfNovo: string;
  crmNovo: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  nomeCompleto: string;
  email: string;
  motivoRejeicao?: string;
  analisadoPor: null;
  analisadoEm: null;
  createdAt: string;
  updatedAt: string;
};
