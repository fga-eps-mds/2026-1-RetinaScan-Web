import { api } from '@/shared/api';

export type GetLogsParams = {
  action?: string;
  actorUserId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  pageSize?: number;
};

export type GetLogsResult<T = any> = {
  data: T[];
  total: number;
};

export async function getLogs(params: GetLogsParams): Promise<GetLogsResult> {
  const res = await api.get('/api/logs', { params });
  return res.data as GetLogsResult;
}
