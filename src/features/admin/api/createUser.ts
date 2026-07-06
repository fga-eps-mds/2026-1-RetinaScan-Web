import { api } from '@/shared/api';
import type { CreateUserDTO } from '../types/user';


// Função para criar um novo usuário no sistema

export async function createUser(data: CreateUserDTO) {
  const response = await api.post('/api/usuarios', data);

  return response.data;
};