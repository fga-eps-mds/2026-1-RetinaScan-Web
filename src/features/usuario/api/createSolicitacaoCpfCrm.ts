import { api } from '@/shared/api';
import type { CreateSolicitacaoCpfCrmInput } from '../types/cpfCrm';

export async function createSolicitacaoCpfCrm(
  payload: CreateSolicitacaoCpfCrmInput
) {
  const { data } = await api.post('/api/usuarios/solicitacoes-cpf-crm', payload);

  return data;
}
