import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createUser } from '@/features/admin/api/createUser';
import { adminKeys } from '@/features/admin/api/queryKeyrs';
import { useCreateUser } from '@/features/admin/hooks/useCreateUser';

vi.mock('@/features/admin/api/createUser', () => ({
  createUser: vi.fn(),
}));

vi.mock('@/features/admin/api/queryKeyrs', () => ({
  adminKeys: {
    users: ['users'],
  },
}));

describe('useCreateUser', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('deve chamar createUser e invalidar as queries ao ter sucesso', async () => {
    const mockUser = { nomeCompleto: 'João Silva', email: 'joao@teste.com' };
    vi.mocked(createUser).mockResolvedValue(mockUser);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate(mockUser as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(createUser).mock.calls[0][0]).toEqual(mockUser);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: adminKeys.users,
    });
  });

  it('deve retornar erro quando a mutação falha', async () => {
    vi.mocked(createUser).mockRejectedValue(new Error('Falha na API'));

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate({} as any);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
