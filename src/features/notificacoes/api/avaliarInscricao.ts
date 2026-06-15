import { api } from '@/shared/api';

/**
 * Define os payloads permitidos para a avaliação.
 * REJEITADA exige obrigatoriamente o campo motivoRejeicao.
 */
export type AvaliarInscricaoPayload = 
  | { decisao: 'APROVADA' }
  | { decisao: 'REJEITADA'; motivoRejeicao: string };

/**
 * Atualiza o status da inscrição via endpoint PATCH.
 * @param id - Identificador único da solicitação de inscrição
 * @param payload - Objeto com a decisão (APROVADA/REJEITADA) e motivo (se necessário)
 */
export const avaliarInscricao = async (id: string, payload: AvaliarInscricaoPayload) => {
  const response = await api.patch(`/api/inscricoes/${id}/avaliar`, payload);
  return response.data;
};