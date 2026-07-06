import { api } from '@/shared/api';
import type { CreateUserDTO } from '../types/user';


// Função para criar um novo usuário no sistema
export const createUser = async (data: any): Promise<CreateUserDTO> => {
  const response = await api.post<CreateUserDTO>('/api/usuarios', data);
  return response.data;
};