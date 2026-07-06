import { api } from '@/shared/api';

// Função para obter todos os usuários do sistema
export async function getAllUsers() {
  const response = await api.get('/api/usuarios');

  return response.data;
}
