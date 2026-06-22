import { useQuery } from '@tanstack/react-query';
import { getSolicitacoesCpfCrm } from '../api/getSolicitacoesCpfCrm';
import { notificacaoKeys } from '../api/queryKeys';

export type GetSolicitacoesParams = {
  status?: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  idUsuario?: string;
  nome?: string;
  email?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'nomeCompleto';
  sortOrder?: 'asc' | 'desc';
};

export function useGetSolicitacoes(filters: GetSolicitacoesParams = {}) {
  return useQuery({
    queryKey: [...notificacaoKeys.solicitacoesCpfCrmList, filters],
    queryFn: () => getSolicitacoesCpfCrm(filters),
  });
}
