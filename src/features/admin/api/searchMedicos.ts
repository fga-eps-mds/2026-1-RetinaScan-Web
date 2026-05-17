import { api } from '@/shared/api';

export type SearchMedicosParams = {
  nome?: string;
  crm?: string;
  email?: string;
};

export async function searchMedicos(params: SearchMedicosParams) {
 
  const response = await api.get('/api/medicos/search', { params });
  return response.data;
}