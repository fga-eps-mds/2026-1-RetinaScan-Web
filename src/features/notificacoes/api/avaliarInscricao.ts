import { api } from '@/shared/api';

export type AvaliarInscricaoPayload = 
  | { decisao: 'APROVADA' }
  | { decisao: 'REJEITADA'; motivoRejeicao: string };

export const avaliarInscricao = async (id: string, payload: AvaliarInscricaoPayload) => {
  const response = await api.patch(`/api/inscricoes/${id}/avaliar`, payload);
  return response.data;
};