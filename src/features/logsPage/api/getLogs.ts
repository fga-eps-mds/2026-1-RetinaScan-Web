import { api } from '@/shared/api';

export type GetLogsParams = {
  action?: string;
  actorUserId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  pageSize?: number;
};

export type GetLogsResult<T = unknown> = {
  data: T[];
  total: number;
};

export async function getLogs<T = unknown>(params: GetLogsParams): Promise<GetLogsResult<T>> {
  const res = await api.get('/api/logs', { params });
  return res.data as GetLogsResult<T>;
}
