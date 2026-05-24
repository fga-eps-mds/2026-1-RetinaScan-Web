// src/test/features/notificacoes/hooks/useListNotifications.test.tsx
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useListNotifications } from '@/features/notificacoes/hooks/useListNotifications';
import { listMyNotifications } from '@/features/notificacoes/api/listMyNotifications';
import { notificationsQueryKey } from '@/features/notificacoes/api/notificationsQueryKey';

vi.mock('@/features/notificacoes/api/listMyNotifications', () => ({
  listMyNotifications: vi.fn(),
}));

vi.mock('@/features/notificacoes/api/notificationsQueryKey', () => ({
  notificationsQueryKey: vi.fn(),
}));

describe('useListNotifications', () => {
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
      },
    });

    vi.mocked(notificationsQueryKey).mockImplementation((filters) => [
      'notifications',
      filters ?? {},
    ]);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('deve chamar notificationsQueryKey e listMyNotifications com filtros informados', async () => {
    const filters = {
      status: 'nao-lidas' as const,
      tipo: 'avaliacao_ia_atualizada' as const,
      limit: 10,
    };

    const response = [
      {
        id: '1',
        tipo: 'avaliacao_ia_atualizada' as const,
        titulo: 'Nova avaliação',
        mensagem: 'A avaliação foi atualizada.',
        dados: null,
        lidaEm: null,
        createdAt: '2026-05-23T12:00:00.000Z',
      },
    ];

    vi.mocked(listMyNotifications).mockResolvedValue(response);

    const { result } = renderHook(() => useListNotifications(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(notificationsQueryKey).toHaveBeenCalledWith(filters);
    expect(vi.mocked(notificationsQueryKey).mock.calls.length).toBeGreaterThan(
      0
    );

    expect(listMyNotifications).toHaveBeenCalledTimes(1);
    expect(listMyNotifications).toHaveBeenCalledWith(filters);

    expect(result.current.data).toEqual(response);
  });

  it('deve usar objeto vazio por padrão quando nenhum filtro for informado', async () => {
    const response = [
      {
        id: '1',
        tipo: 'avaliacao_ia_revisada_por_especialista' as const,
        titulo: 'Revisão concluída',
        mensagem: 'A revisão foi concluída.',
        dados: null,
        lidaEm: null,
        createdAt: '2026-05-23T12:00:00.000Z',
      },
    ];

    vi.mocked(listMyNotifications).mockResolvedValue(response);

    const { result } = renderHook(() => useListNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(notificationsQueryKey).toHaveBeenCalledWith({});
    expect(listMyNotifications).toHaveBeenCalledWith({});
    expect(result.current.data).toEqual(response);
  });

  it('deve expor estado de erro quando a busca falhar', async () => {
    vi.mocked(listMyNotifications).mockRejectedValue(
      new Error('Erro ao listar')
    );

    const { result } = renderHook(
      () => useListNotifications({ status: 'todas' }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Erro ao listar');
  });

  it('deve armazenar o resultado no cache usando a query key gerada', async () => {
    const filters = { status: 'lidas' as const };

    const queryKey = ['notifications', filters] as const;
    const response = [
      {
        id: '2',
        tipo: 'status_solicitacao_cadastral_atualizado' as const,
        titulo: 'Cadastro atualizado',
        mensagem: 'Sua solicitação foi processada.',
        dados: { solicitacaoId: 'abc' },
        lidaEm: '2026-05-23T13:00:00.000Z',
        createdAt: '2026-05-23T11:00:00.000Z',
      },
    ];

    vi.mocked(notificationsQueryKey).mockReturnValue(queryKey);
    vi.mocked(listMyNotifications).mockResolvedValue(response);

    const { result } = renderHook(() => useListNotifications(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(queryKey)).toEqual(response);
  });

  it('não deve refazer a busca imediatamente para a mesma query key por causa do staleTime', async () => {
    const filters = { status: 'todas' as const };
    const response = [
      {
        id: '1',
        tipo: 'avaliacao_ia_atualizada' as const,
        titulo: 'Nova avaliação',
        mensagem: 'A avaliação foi atualizada.',
        dados: null,
        lidaEm: null,
        createdAt: '2026-05-23T12:00:00.000Z',
      },
    ];

    vi.mocked(listMyNotifications).mockResolvedValue(response);

    const wrapper = createWrapper();

    const first = renderHook(() => useListNotifications(filters), {
      wrapper,
    });

    await waitFor(() => {
      expect(first.result.current.isSuccess).toBe(true);
    });

    const second = renderHook(() => useListNotifications(filters), {
      wrapper,
    });

    await waitFor(() => {
      expect(second.result.current.isSuccess).toBe(true);
    });

    expect(listMyNotifications).toHaveBeenCalledTimes(1);
  });
});
