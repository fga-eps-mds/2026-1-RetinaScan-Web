import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAllUsers } from '@/features/admin/api/getAllUsers';
import { useGetAllUsers } from '@/features/admin/hooks/useGetAllUsers';

vi.mock('@/features/admin/api/getAllUsers', () => ({
  getAllUsers: vi.fn(),
}));

vi.mock('@/features/admin/api/queryKeyrs', () => ({
  adminKeys: {
    users: ['users'],
  },
}));

describe('useGetAllUsers', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('deve retornar a lista de usuários com sucesso', async () => {
    const mockUsers = [
      { id: '1', nomeCompleto: 'João Silva' },
      { id: '2', nomeCompleto: 'Maria Souza' },
    ];

    vi.mocked(getAllUsers).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useGetAllUsers(), { wrapper });

    // No useQuery, verificamos o estado de carregamento inicial
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
    expect(getAllUsers).toHaveBeenCalledTimes(1);
  });

  it('deve retornar estado de erro quando a API falha', async () => {
    const error = new Error('Erro ao buscar usuários');
    vi.mocked(getAllUsers).mockRejectedValue(error);

    const { result } = renderHook(() => useGetAllUsers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});
