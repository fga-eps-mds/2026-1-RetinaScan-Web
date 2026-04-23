import { api } from '@/shared/api';
import axios from 'axios';

export async function updateProfileImage(file: File) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.patch('/api/usuarios/imagem', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? 'Erro ao enviar imagem.'
      );
    }
    throw new Error('Erro ao atualizar imagem de perfil.');
  }
}
