import { api } from '@/shared/api';

export type InscricaoStatus =
  | 'CONVITE_ENVIADO'
  | 'PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'EXPIRADA';

export type InscricaoStatusFilter = InscricaoStatus | 'TODAS';

export interface InscricaoPendente {
  id: string;
  email: string;
  token: string;
  tokenExpiresAt: string;
  status: InscricaoStatus;
  invitedBy: string;
  nomeCompleto: string | null;
  tipoPerfil: 'MEDICO' | 'ESPECIALISTA' | null;
  cpf: string | null;
  crm: string | null;
  dtNascimento: string | null;
  submittedAt: string | null;
  motivoRejeicao: string | null;
  analisadoPor: string | null;
  analisadoEm: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getInscricoesPendentes = async (
  status: InscricaoStatusFilter = 'PENDENTE'
): Promise<InscricaoPendente[]> => {
  const response = await api.get<{ data: InscricaoPendente[] }>(
    '/api/inscricoes',
    {
      params: status === 'TODAS' ? undefined : { status },
    }
  );

  return response.data.data;
};
