import { api } from '@/shared/api';

// Parâmetros de pesquisa para médicos
export type SearchMedicosParams = {
  nome?: string;
  crm?: string;
  email?: string;
  tipoPerfil?: 'MEDICO' | 'ESPECIALISTA';
};

// Função para pesquisar médicos com base nos parâmetros fornecidos
export async function searchMedicos(params: SearchMedicosParams) {
 
  const response = await api.get('/api/medicos/search', { params });
  return response.data;
}