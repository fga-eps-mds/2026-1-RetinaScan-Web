import { useQuery } from '@tanstack/react-query';
import { getMinhasSolicitacoesCpfCrm } from '../api/getMinhasSolicitacoesCpfCrm';

export function useGetMinhasSolicitacoesCpfCrm() {
  return useQuery({
    queryKey: ['minhas-solicitacoes-cpf-crm'],
    queryFn: getMinhasSolicitacoesCpfCrm,
  });
}
