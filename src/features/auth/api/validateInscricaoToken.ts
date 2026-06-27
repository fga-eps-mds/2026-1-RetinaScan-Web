import { api } from '@/shared/api';
import axios from 'axios';

export type ValidateInscricaoTokenResponse = {
  email: string;
  nomeCompleto: string | null;
  tipoPerfil: 'MEDICO' | 'ESPECIALISTA' | null;
  tokenExpiresAt: string;
};

type ApiErrorResponse = {
  message?: string;
};

export async function validateInscricaoToken(
  token: string
): Promise<ValidateInscricaoTokenResponse> {
  try {
    const { data } = await api.get<ValidateInscricaoTokenResponse>(
      `/api/inscricoes/convites/${encodeURIComponent(token)}`
    );

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw new Error(
        error.response?.data?.message || 'Link inválido ou expirado.'
      );
    }

    throw new Error('Erro de rede ou servidor.');
  }
}
