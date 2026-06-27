// features/inscricao/api/submitInscricao.ts
import { api } from '@/shared/api';

export type SubmitInscricaoDTO = {
  token: string;
  nomeCompleto: string;
  cpf: string;
  crm: string;
  dtNascimento: string;
  senha: string;
};

export async function submitInscricao(data: SubmitInscricaoDTO) {
  const response = await api.post('/api/inscricoes/submeter', data);
  return response.data;
}
