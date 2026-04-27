import { api } from '@/shared/api';
import type { Solicitacao } from '../types/Solicitacao';

type GetSolicitacoesCpfCrmResponse = {
  solicitacoes: Solicitacao[];
};

export async function getSolicitacoesCpfCrm() {
  const { data } = await api.get<GetSolicitacoesCpfCrmResponse>(
    '/api/usuarios/solicitacoes-cpf-crm'
  );

  return data.solicitacoes;
}
