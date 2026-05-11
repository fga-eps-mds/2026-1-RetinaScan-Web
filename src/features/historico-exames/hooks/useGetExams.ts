import { useQuery } from '@tanstack/react-query';
import { getExams, type ExamsParams } from '../api/getExams';
import type { ExameHistory } from '../types/exam-history';

export interface PaginatedExams {
  data: ExameHistory[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useGetExams(params: ExamsParams) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => getExams(params),
    staleTime: 30_000,
    select: (response: PaginatedExams) => response.data, // Só retorna data
  });
}
