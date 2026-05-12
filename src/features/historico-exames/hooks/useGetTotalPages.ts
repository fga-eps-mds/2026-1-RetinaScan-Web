import { useQuery } from '@tanstack/react-query';
import { type ExamsParams, getExams } from '../api/getExams';
import type { PaginatedExams } from './useGetExams';

export function useExamsPagination(params: ExamsParams) {
  return useQuery({
    queryKey: ['exams', 'pagination', params],
    queryFn: () => getExams(params),
    staleTime: 0,
    select: (response: PaginatedExams) => response.pagination,
  });
}
