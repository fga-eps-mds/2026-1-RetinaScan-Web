import { api } from '@/shared/api';
import axios from 'axios';

type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

type ResetPasswordResponse = {
  success: boolean;
  message?: string;
};

type ApiErrorResponse = {
  message?: string;
};

export async function resetPassword({
  token,
  newPassword,
}: ResetPasswordInput): Promise<ResetPasswordResponse> {
  try {
    const { data } = await api.post<ResetPasswordResponse>(
      '/api/auth/reset-password',
      {
        token,
        newPassword,
      }
    );

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw new Error(
        error.response?.data?.message || 'Não foi possível redefinir a senha.'
      );
    }

    throw new Error('Erro de rede ou servidor');
  }
}
