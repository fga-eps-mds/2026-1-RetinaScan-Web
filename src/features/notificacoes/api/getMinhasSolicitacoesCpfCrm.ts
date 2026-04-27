import { api } from '@/shared/api';
import type { Solicitacao } from '../types/Solicitacao';

type GetMinhasSolicitacoesCpfCrmResponse = {
  solicitacoes: Solicitacao[];
};

export async function getMinhasSolicitacoesCpfCrm(): Promise<Solicitacao[]> {
  const { data } = await api.get<GetMinhasSolicitacoesCpfCrmResponse>(
    '/api/usuarios/minhas-solicitacoes-cpf-crm'
  );

  return data.solicitacoes;
}
