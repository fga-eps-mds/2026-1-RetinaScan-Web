import { api } from '@/shared/api';

type RejeitarSolicitacaoCrmParams = {
  id: string;
  motivoRejeicao: string;
};

export async function rejeitarSolicitacaoCrm({
  id,
  motivoRejeicao,
}: RejeitarSolicitacaoCrmParams) {
  const { data } = await api.patch(
    `/api/usuarios/solicitacoes-cpf-crm/${id}/rejeitar`,
    { motivoRejeicao }
  );

  return data;
}
