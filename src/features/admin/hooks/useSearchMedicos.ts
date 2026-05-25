import { useQuery } from '@tanstack/react-query';
import { searchMedicos, type SearchMedicosParams } from '../api/searchMedicos';

export function useSearchMedicos(filters: SearchMedicosParams) {
  return useQuery({
    queryKey: ['admin', 'medicos', 'search', filters],
    queryFn: () => searchMedicos(filters),
    retry: false,
    staleTime: 5000, 
   
  });
}