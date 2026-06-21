import { api } from '@/shared/api';

export async function deleteSolicitacao(id: string): Promise<void> {
  await api.delete(`/api/usuario/solicitacoes-cpf-crm/${id}`);
}
