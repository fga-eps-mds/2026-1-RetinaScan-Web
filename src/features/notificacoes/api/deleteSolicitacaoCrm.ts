import { api } from '@/shared/api';

export async function deleteSolicitacao(id: string): Promise<void> {
  await api.delete(`/api/usuarios/solicitacoes-cpf-crm/${id}`);
}
