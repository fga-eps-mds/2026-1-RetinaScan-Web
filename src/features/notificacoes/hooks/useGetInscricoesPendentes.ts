import { useQuery } from '@tanstack/react-query';
import { getInscricoesPendentes } from '../api/getInscricoesPendentes';

export const useGetInscricoesPendentes = () => {
  return useQuery({
    queryKey: ['inscricoes', 'pendentes'],
    queryFn: getInscricoesPendentes,
  });
};