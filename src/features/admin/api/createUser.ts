import { api } from '@/shared/api';
import type { CreateUserDTO } from '../types/user';

export async function createUser(data: CreateUserDTO) {
  const response = await api.post('/api/usuarios', data);

  return response.data;
}
