import { api } from '@/shared/api';

export interface EnviarConvitePayload {
  convites: Array<{
    email: string;
    nome: string;
    tipoPerfil: 'MEDICO' | 'ESPECIALISTA';
  }>;
}

export interface EnviarConviteDetalhe {
  email: string;
  status: 'enviado' | 'ignorado';
  motivo?: string;
}

export interface EnviarConviteResponse {
  enviados: number;
  ignorados: number;
  detalhes: EnviarConviteDetalhe[];
}

export const enviarConvite = async (
  data: EnviarConvitePayload
): Promise<EnviarConviteResponse> => {
  const response = await api.post<EnviarConviteResponse>(
    '/api/inscricoes/convites',
    data
  );

  return response.data;
};
