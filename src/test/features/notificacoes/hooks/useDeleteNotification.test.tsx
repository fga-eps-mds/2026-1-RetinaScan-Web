// src/test/features/notificacoes/hooks/useDeleteNotification.test.tsx
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteNotification } from '@/features/notificacoes/hooks/useDeleteNotification';
import { deleteNotification } from '@/features/notificacoes/api/deleteNotification';

vi.mock('@/features/notificacoes/api/deleteNotification', () => ({
  deleteNotification: vi.fn(),
}));

describe('useDeleteNotification', () => {
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
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('deve chamar deleteNotification com o id informado', async () => {
    vi.mocked(deleteNotification).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('notif-123');
    });

    expect(deleteNotification).toHaveBeenCalledTimes(1);
    expect(vi.mocked(deleteNotification).mock.calls[0][0]).toBe('notif-123');
  });

  it('deve remover a notificação do cache em caso de sucesso', async () => {
    vi.mocked(deleteNotification).mockResolvedValue(undefined);

    queryClient.setQueryData(
      ['notifications'],
      [
        { id: '1', titulo: 'Primeira' },
        { id: '2', titulo: 'Segunda' },
        { id: '3', titulo: 'Terceira' },
      ]
    );

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('2');
    });

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      { id: '1', titulo: 'Primeira' },
      { id: '3', titulo: 'Terceira' },
    ]);
  });

  it('não deve alterar o cache quando não houver dados prévios', async () => {
    vi.mocked(deleteNotification).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(queryClient.getQueryData(['notifications'])).toBeUndefined();
  });

  it('não deve alterar itens diferentes do removido', async () => {
    vi.mocked(deleteNotification).mockResolvedValue(undefined);

    queryClient.setQueryData(
      ['notifications'],
      [
        { id: '1', titulo: 'Primeira', extra: 'a' },
        { id: '2', titulo: 'Segunda', extra: 'b' },
      ]
    );

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('1');
    });

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      { id: '2', titulo: 'Segunda', extra: 'b' },
    ]);
  });

  it('deve propagar erro e não remover do cache quando a mutation falhar', async () => {
    vi.mocked(deleteNotification).mockRejectedValue(
      new Error('Erro ao remover')
    );

    queryClient.setQueryData(
      ['notifications'],
      [
        { id: '1', titulo: 'Primeira' },
        { id: '2', titulo: 'Segunda' },
      ]
    );

    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync('1');
      })
    ).rejects.toThrow('Erro ao remover');

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      { id: '1', titulo: 'Primeira' },
      { id: '2', titulo: 'Segunda' },
    ]);
  });
});
