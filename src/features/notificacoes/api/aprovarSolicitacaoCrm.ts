import { api } from '@/shared/api';

export async function aceitarSolicitacaoCrm(id: string) {
  const { data } = await api.patch(
    `/api/usuarios/solicitacoes-cpf-crm/${id}/aprovar`
  );

  return data;
}
