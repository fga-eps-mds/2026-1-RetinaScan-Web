import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLogs } from '@/features/logsPage/api/getLogs';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('getLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a API com a rota correta e repassar os parâmetros', async () => {
    const response = {
      data: {
        data: [{ id: '1', action: 'APPROVE' }],
        total: 1,
      },
    };

    vi.mocked(api.get).mockResolvedValueOnce(response as any);

    const result = await getLogs({
      action: 'APPROVE',
      page: 1,
      pageSize: 20,
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });

    expect(api.get).toHaveBeenCalledWith('/api/logs', {
      params: {
        action: 'APPROVE',
        page: 1,
        pageSize: 20,
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      },
    });
    expect(result).toEqual(response.data);
  });
});
