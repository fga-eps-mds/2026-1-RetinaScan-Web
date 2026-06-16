import { api } from '@/shared/api';
import { useQuery } from '@tanstack/react-query';

type ExamLockInfo = {
  isBeingEdited: boolean;
  editor: { userId: string; nome: string } | null;
};

type ExamEditingLocksResponse = {
  locks: Record<string, ExamLockInfo>;
};

export function useExamEditingLocks(examIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['exam-editing-locks', examIds],
    queryFn: async () => {
      const { data } = await api.get<ExamEditingLocksResponse>(
        '/api/report/editing-locks',
        {
          params: { examIds: examIds.join(',') },
        }
      );
      return data.locks;
    },
    enabled: enabled && examIds.length > 0,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}
