import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExamsPagination } from '@/features/historico-exames/hooks/useGetTotalPages';
import * as getExamsApi from '@/features/historico-exames/api/getExams';

vi.mock('@/features/historico-exames/api/getExams', () => ({
  getExams: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useExamsPagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar getExams com os params corretos e retornar apenas pagination', async () => {
    const params = {
      cpf: '12345678900',
      nomeCompleto: 'Ana Silva',
      page: 2,
      pageSize: 20,
    };

    const mockPagination = {
      page: 2,
      pageSize: 20,
      total: 35,
      totalPages: 2,
    };

    vi.mocked(getExamsApi.getExams).mockResolvedValue({
      data: [
        {
          id: 'EX-1234-5678',
          nomeCompleto: 'Ana Silva',
          olho: 'OD',
          scoreIA: '90',
          status: 'Normal',
          dtCriacao: '2026-05-10T10:00:00.000Z',
        },
      ],
      pagination: mockPagination,
    });

    const { result } = renderHook(() => useExamsPagination(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getExamsApi.getExams).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockPagination);
  });

  it('deve retornar a paginação mesmo quando data vier vazia', async () => {
    const params = {
      page: 1,
      pageSize: 20,
      nomeCompleto: '',
      cpf: '',
    };

    const mockPagination = {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    };

    vi.mocked(getExamsApi.getExams).mockResolvedValue({
      data: [],
      pagination: mockPagination,
    });

    const { result } = renderHook(() => useExamsPagination(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPagination);
  });

  it('deve expor erro quando getExams falhar', async () => {
    const params = {
      page: 1,
      pageSize: 20,
      nomeCompleto: '',
      cpf: '',
    };

    const error = new Error('Erro ao buscar paginação');

    vi.mocked(getExamsApi.getExams).mockRejectedValue(error);

    const { result } = renderHook(() => useExamsPagination(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('deve refazer a consulta quando os params mudarem', async () => {
    const firstParams = {
      page: 1,
      pageSize: 20,
      nomeCompleto: '',
      cpf: '',
    };

    const secondParams = {
      page: 2,
      pageSize: 20,
      nomeCompleto: '',
      cpf: '',
    };

    vi.mocked(getExamsApi.getExams)
      .mockResolvedValueOnce({
        data: [],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 40,
          totalPages: 2,
        },
      })
      .mockResolvedValueOnce({
        data: [],
        pagination: {
          page: 2,
          pageSize: 20,
          total: 40,
          totalPages: 2,
        },
      });

    const { result, rerender } = renderHook(
      ({ params }) => useExamsPagination(params),
      {
        initialProps: { params: firstParams },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      page: 1,
      pageSize: 20,
      total: 40,
      totalPages: 2,
    });

    rerender({ params: secondParams });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        page: 2,
        pageSize: 20,
        total: 40,
        totalPages: 2,
      });
    });

    expect(getExamsApi.getExams).toHaveBeenCalledTimes(2);
    expect(getExamsApi.getExams).toHaveBeenNthCalledWith(1, firstParams);
    expect(getExamsApi.getExams).toHaveBeenNthCalledWith(2, secondParams);
  });
});
