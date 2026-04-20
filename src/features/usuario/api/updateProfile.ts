import { api } from '@/shared/api';
import axios from 'axios';

export type UpdateProfileData = {
  nomeCompleto?: string;
  email?: string;
  dataNascimento?: string;
  senhaAtual?: string;
  novaSenha?: string;
};

export async function updateProfile(data: UpdateProfileData) {
  try {
    const response = await api.put('/api/usuarios', data);

    console.log('Resposta da API:', response.data);

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      if (responseData?.fields?.length) {
        const messages = responseData.fields
          .map((field: { message: string }) => field.message)
          .join('\n');

        throw new Error(messages);
      }

      if (responseData?.message) {
        throw new Error(responseData.message);
      }
    }

    throw new Error('Erro ao atualizar perfil.');
  }
}
