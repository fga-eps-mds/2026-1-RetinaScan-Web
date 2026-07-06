import { api } from '@/shared/api';

// Interface para convite de novos usuários do sistema
export interface EnviarConvitePayload {
  convites: Array<{
    email: string;
    nome: string;
    tipoPerfil: 'MEDICO' | 'ESPECIALISTA';
  }>;
}

// Detalhes do resultado do envio de convites
export interface EnviarConviteDetalhe {
  email: string;
  status: 'enviado' | 'ignorado';
  motivo?: string;
}

// Resposta do envio de convites
export interface EnviarConviteResponse {
  enviados: number;
  ignorados: number;
  detalhes: EnviarConviteDetalhe[];
}

// Função para enviar convites para novos usuários do sistema
export const enviarConvite = async (
  data: EnviarConvitePayload
): Promise<EnviarConviteResponse> => {
  const response = await api.post<EnviarConviteResponse>(
    '/api/inscricoes/convites',
    data
  );

  return response.data;
};
