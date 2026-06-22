import { api } from '@/shared/api';
import type { Solicitacao } from '../types/Solicitacao';
import type { GetSolicitacoesParams } from '../hooks/useGetSolicitacoes';

type GetSolicitacoesCpfCrmResponse = {
  solicitacoes: Solicitacao[];
};

export async function getSolicitacoesCpfCrm(
  filters: GetSolicitacoesParams = {}
) {
  const { data } = await api.get<GetSolicitacoesCpfCrmResponse>(
    '/api/usuarios/solicitacoes-cpf-crm',
    { params: filters }
  );

  return data.solicitacoes;
}
