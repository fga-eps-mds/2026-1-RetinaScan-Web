import { useQuery } from '@tanstack/react-query';
import { getLogs, type GetLogsParams, type GetLogsResult } from '../api/getLogs';
import { logsKeys } from '../api/queryKeys';

export function useGetLogs(params: GetLogsParams) {
  const { page = 1, pageSize = 20, ...filters } = params;

  return useQuery<GetLogsResult>({
    queryKey: logsKeys.list({ page, pageSize, ...filters }),
    queryFn: () => getLogs({ page, pageSize, ...filters }),
    staleTime: 1000 * 60,
  });
}
