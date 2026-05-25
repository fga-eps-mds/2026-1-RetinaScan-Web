// src/test/features/notificacoes/hooks/useMarkNotificationAsRead.test.tsx
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMarkNotificationAsRead } from '@/features/notificacoes/hooks/useMarkNotificationAsRead';
import { markNotificationAsRead } from '@/features/notificacoes/api/markNotificationAsRead';

vi.mock('@/features/notificacoes/api/markNotificationAsRead', () => ({
  markNotificationAsRead: vi.fn(),
}));

describe('useMarkNotificationAsRead', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T15:00:00.000Z'));

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },
        mutations: {
          retry: false,
        },
      },
    });

    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(
      undefined as any
    );
  });

  afterEach(() => {
    queryClient.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('deve chamar markNotificationAsRead com o id informado', async () => {
    vi.mocked(markNotificationAsRead).mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('notif-123');
    });

    expect(markNotificationAsRead).toHaveBeenCalledTimes(1);
    expect(vi.mocked(markNotificationAsRead).mock.calls[0][0]).toBe(
      'notif-123'
    );
  });

  it('deve marcar a notificação como lida no cache em caso de sucesso', async () => {
    vi.mocked(markNotificationAsRead).mockResolvedValue(undefined);

    queryClient.setQueryData(
      ['notifications'],
      [
        { id: '1', titulo: 'Primeira', lidaEm: null },
        { id: '2', titulo: 'Segunda', lidaEm: null },
      ]
    );

    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      {
        id: '1',
        titulo: 'Primeira',
        lidaEm: '2026-05-23T15:00:00.000Z',
      },
      {
        id: '2',
        titulo: 'Segunda',
        lidaEm: null,
      },
    ]);
  });

  it('não deve alterar o cache quando não houver dados prévios', async () => {
    vi.mocked(markNotificationAsRead).mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(queryClient.getQueryData(['notifications'])).toBeUndefined();
  });

  it('não deve alterar itens diferentes do id informado', async () => {
    vi.mocked(markNotificationAsRead).mockResolvedValue(undefined);

    queryClient.setQueryData(
      ['notifications'],
      [
        { id: '1', titulo: 'Primeira', lidaEm: null, extra: 'a' },
        {
          id: '2',
          titulo: 'Segunda',
          lidaEm: '2026-05-20T10:00:00.000Z',
          extra: 'b',
        },
      ]
    );

    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      {
        id: '1',
        titulo: 'Primeira',
        lidaEm: '2026-05-23T15:00:00.000Z',
        extra: 'a',
      },
      {
        id: '2',
        titulo: 'Segunda',
        lidaEm: '2026-05-20T10:00:00.000Z',
        extra: 'b',
      },
    ]);
  });

  it('deve invalidar as queries de notifications após sucesso', async () => {
    vi.mocked(markNotificationAsRead).mockResolvedValue(undefined);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['notifications'],
    });
  });

  it('deve propagar erro e não alterar o cache quando a mutation falhar', async () => {
    vi.mocked(markNotificationAsRead).mockRejectedValue(
      new Error('Erro ao marcar como lida')
    );

    queryClient.setQueryData(
      ['notifications'],
      [
        { id: '1', titulo: 'Primeira', lidaEm: null },
        { id: '2', titulo: 'Segunda', lidaEm: null },
      ]
    );

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('1');
      })
    ).rejects.toThrow('Erro ao marcar como lida');

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      { id: '1', titulo: 'Primeira', lidaEm: null },
      { id: '2', titulo: 'Segunda', lidaEm: null },
    ]);

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
