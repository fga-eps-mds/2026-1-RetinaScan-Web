import { useQuery } from '@tanstack/react-query';
import { getResultadoExame } from '../api/getResultadoExame';

export function useGetResultadoExame(examId?: string) {
  return useQuery({
    queryKey: ['exams', 'result', examId],
    queryFn: () => getResultadoExame(examId ?? ''),
    enabled: Boolean(examId),
    staleTime: 0,
  });
}