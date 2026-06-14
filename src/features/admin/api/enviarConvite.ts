import { api } from '@/shared/api';

// Define o contrato de dados esperado pelo endpoint POST /api/inscricoes/convites
export interface EnviarConvitePayload {
  convites: Array<{
    email: string;
    nome: string;
    tipoPerfil: 'MEDICO' | 'ESPECIALISTA';
  }>;
}

/**
 * Dispara convites em lote. 
 * Nota: O backend valida duplicidade de e-mail antes do processamento.
 */
export const enviarConvite = async (data: EnviarConvitePayload) => {
  // Chamada direta conforme documentação da API de inscrições
  const response = await api.post('/api/inscricoes/convites', data);
  return response.data;
};