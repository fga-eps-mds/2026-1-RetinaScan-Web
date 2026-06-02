import { useQuery } from '@tanstack/react-query';
import type { LogEntry } from '../types/log';
import { getLogs, type GetLogsParams, type GetLogsResult } from '../api/getLogs';
import { logsKeys } from '../api/queryKeys';

export function useGetLogs(params: GetLogsParams) {
  const { page = 1, pageSize = 20, ...filters } = params;

  return useQuery<GetLogsResult<LogEntry>>({
    queryKey: logsKeys.list({ page, pageSize, ...filters }),
    queryFn: () => getLogs<LogEntry>({ page, pageSize, ...filters }),
    staleTime: 1000 * 60,
  });
}
