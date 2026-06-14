import { api } from '@/shared/api';

export type InscricaoStatus = 'CONVITE_ENVIADO' | 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'EXPIRADA';

export interface InscricaoPendente {
  id: string;
  email: string;
  nomeCompleto: string;
  cpf: string;
  crm: string;
  dtNascimento: string;
  status: InscricaoStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const getInscricoesPendentes = async (): Promise<InscricaoPendente[]> => {
  const response = await api.get<{ data: InscricaoPendente[] }>('/api/inscricoes', {
    params: { status: 'PENDENTE' },
  });
  return response.data.data;
};