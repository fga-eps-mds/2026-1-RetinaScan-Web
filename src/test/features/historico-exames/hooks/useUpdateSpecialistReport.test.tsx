import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateSpecialistReport } from '@/features/historico-exames/hooks/useUpdateSpecialistReport';
import { updateSpecialistReport } from '@/features/historico-exames/api/updateSpecialistReport';

vi.mock('@/features/historico-exames/api/updateSpecialistReport', () => ({
  updateSpecialistReport: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('useUpdateSpecialistReport', () => {
  it('deve atualizar o laudo e invalidar a query do exame correspondente', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const mockPayload = { examId: 'exam-999', texto: 'Alterado', resultadoIaValido: false, html: '<p></p>', json: {} };

    vi.mocked(updateSpecialistReport).mockResolvedValueOnce({ message: 'Success' });

    const { result } = renderHook(() => useUpdateSpecialistReport(), { wrapper });
    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['resultado-exame', 'exam-999'] });
  });
});