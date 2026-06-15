import { useQuery } from '@tanstack/react-query';
import { getInscricoesPendentes } from '../api/getInscricoesPendentes';
import type { InscricaoStatus } from '../api/getInscricoesPendentes';

export type InscricaoStatusFilter = InscricaoStatus | 'TODAS';

export const useGetInscricoesPendentes = (
  status: InscricaoStatusFilter = 'PENDENTE'
) => {
  return useQuery({
    queryKey: ['inscricoes', 'todas', status],
    queryFn: () => getInscricoesPendentes(status),
  });
};
