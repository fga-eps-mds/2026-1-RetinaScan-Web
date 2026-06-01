import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGetLogs } from '@/features/logsPage/hooks/useGetLogs';
import { getLogs } from '@/features/logsPage/api/getLogs';

vi.mock('@/features/logsPage/api/getLogs', () => ({
  getLogs: vi.fn(),
}));

describe('useGetLogs', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve buscar logs com paginação e filtros', async () => {
    const payload = { data: [{ id: '1', action: 'APPROVE' }], total: 1 };
    vi.mocked(getLogs).mockResolvedValueOnce(payload as any);

    const { result } = renderHook(
      () =>
        useGetLogs({
          page: 2,
          pageSize: 20,
          action: 'APPROVE',
          startDate: '2026-05-01',
          endDate: '2026-05-31',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getLogs).toHaveBeenCalledWith({
      page: 2,
      pageSize: 20,
      action: 'APPROVE',
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });
    expect(result.current.data).toEqual(payload);
  });
});
