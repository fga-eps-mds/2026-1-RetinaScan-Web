import { useQuery } from '@tanstack/react-query';
import { getInscricoesPendentes } from '../api/getInscricoesPendentes';

/**
 * Hook que gerencia a listagem de inscrições.
 * A queryKey 'todas' garante que o React Query invalide e atualize os dados 
 * corretamente sempre que houver mutações relacionadas a inscrições.
 */
export const useGetInscricoesPendentes = () => {
  return useQuery({
    queryKey: ['inscricoes', 'todas'], 
    queryFn: () => getInscricoesPendentes(), 
  });
};