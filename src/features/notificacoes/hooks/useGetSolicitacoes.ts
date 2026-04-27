import { useQuery } from '@tanstack/react-query';
import { getSolicitacoesCpfCrm } from '../api/getSolicitacoesCpfCrm';

export function useGetSolicitacoes() {
  return useQuery({
    queryKey: ['solicitacoes-cpf-crm'],
    queryFn: getSolicitacoesCpfCrm,
  });
}
