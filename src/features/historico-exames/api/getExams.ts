import { api } from '@/shared/api';

export type ExamsParams = {
  cpf?: string;
  nomeCompleto?: string;
  page?: number;
  pageSize?: number;
};

export async function getExams(params: ExamsParams) {
  const searchParams = new URLSearchParams();

  if (params.cpf) searchParams.set('cpf', params.cpf);
  if (params.nomeCompleto)
    searchParams.set('nomeCompleto', params.nomeCompleto);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  const response = await api.get(`/api/exams?${searchParams.toString()}`);

  return response.data;
}
