import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useGetExams } from '@/features/historico-exames/hooks/useGetExams';
import * as getExamsApi from '@/features/historico-exames/api/getExams';
import type { ExameHistory } from '@/features/historico-exames/types/exam-history';

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
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useGetExams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar getExams com os params corretos e retornar apenas data', async () => {
    const params = {
      page: 1,
      pageSize: 20,
      nomeCompleto: 'Ana',
      id: '',
      status: 'Normal',
    };

    const mockData: ExameHistory[] = [
      {
        id: 'EX-1234-5678',
        nomeCompleto: 'Ana Silva',
        olho: 'OD' as any,
        scoreIA: '90',
        status: 'Normal',
        dtCriacao: '2026-05-10T10:00:00.000Z',
      },
    ];

    vi.mocked(getExamsApi.getExams).mockResolvedValue({
      data: mockData,
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useGetExams(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getExamsApi.getExams).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockData);
  });

  it('deve retornar array vazio quando a API retornar data vazia', async () => {
    const params = {
      page: 1,
      pageSize: 20,
      nomeCompleto: '',
      id: '',
      status: '',
    };

    vi.mocked(getExamsApi.getExams).mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useGetExams(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('deve expor erro quando getExams falhar', async () => {
    const params = {
      page: 1,
      pageSize: 20,
      nomeCompleto: '',
      id: '',
      status: '',
    };

    const error = new Error('Erro ao buscar exames');

    vi.mocked(getExamsApi.getExams).mockRejectedValue(error);

    const { result } = renderHook(() => useGetExams(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('deve usar a queryKey com exams e params', async () => {
    const params = {
      page: 2,
      pageSize: 10,
      nomeCompleto: 'Bruno',
      id: '',
      status: 'Pendente',
    };

    vi.mocked(getExamsApi.getExams).mockResolvedValue({
      data: [],
      pagination: {
        page: 2,
        pageSize: 10,
        total: 0,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => useGetExams(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getExamsApi.getExams).toHaveBeenCalledWith(params);
  });
});