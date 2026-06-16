import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExamEditingLocks } from  '@/features/historico-exames/hooks/useExamEditingLocks';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: { get: vi.fn() },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('useExamEditingLocks', () => {
  it('deve buscar os locks de edição com os IDs de exames concatenados por vírgula', async () => {
    const { wrapper } = createWrapper();
    const mockLocks = {
      'exam-1': { isBeingEdited: true, editor: { userId: '1', nome: 'Dr. João' } },
    };

    vi.mocked(api.get).mockResolvedValueOnce({ data: { locks: mockLocks } });

    const { result } = renderHook(() => useExamEditingLocks(['exam-1', 'exam-2']), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/api/report/editing-locks', {
      params: { examIds: 'exam-1,exam-2' },
    });
    expect(result.current.data).toEqual(mockLocks);
  });

  it('não deve disparar a query se enabled for false ou a lista de IDs for vazia', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useExamEditingLocks([], false), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });
});