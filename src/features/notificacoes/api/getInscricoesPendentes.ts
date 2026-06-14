import { api } from '@/shared/api';

/**
 * Estados possíveis no ciclo de vida de uma inscrição médica.
 */
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

/**
 * Busca inscrições filtradas por status.
 * Atualmente configurado para listar apenas convites disparados ('CONVITE_ENVIADO').
 */
export const getInscricoesPendentes = async (): Promise<InscricaoPendente[]> => {
  const response = await api.get<{ data: InscricaoPendente[] }>('/api/inscricoes', {
    // Filtro aplicado no backend para restringir o retorno
    params: { status: 'CONVITE_ENVIADO' }, 
  });
  return response.data.data;
};