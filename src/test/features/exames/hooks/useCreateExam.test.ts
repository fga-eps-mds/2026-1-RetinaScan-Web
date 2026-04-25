import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createExam } from '@/features/exames/api/createExam';
import { useCreateExam } from '@/features/exames/hooks/useCreateExam';

vi.mock('@/features/exames/api/createExam', () => ({
  createExam: vi.fn(),
}));

describe('useCreateExam', () => {
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

  it('deve chamar createExam e concluir com sucesso', async () => {
    const examData = {
      nomeCompleto: 'Joao Santos',
      cpf: '12345678901',
      sexo: 'MASCULINO',
      dtNascimento: '1985-09-21',
      dtHora: '2026-04-24T12:00:00.000Z',
      descricao: 'Checkup',
    };

    vi.mocked(createExam).mockResolvedValue({ id: 'exam-1', ...examData } as any);

    const { result } = renderHook(() => useCreateExam(), { wrapper });

    result.current.mutate(examData as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(createExam).mock.calls[0][0]).toEqual(examData);
  });

  it('deve retornar erro quando a mutacao falha', async () => {
    vi.mocked(createExam).mockRejectedValue(new Error('Falha na API'));

    const { result } = renderHook(() => useCreateExam(), { wrapper });

    result.current.mutate({} as any);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
