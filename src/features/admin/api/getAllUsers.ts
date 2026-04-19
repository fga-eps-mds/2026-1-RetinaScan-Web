import { api } from '@/shared/api';

export async function getAllUsers() {
  const response = await api.get('/api/usuarios');

  return response.data;
}
