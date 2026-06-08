import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateSpecialistReport } from '@/features/historico-exames/hooks/useCreateSpecialistReport';
import { createSpecialistReport } from '@/features/historico-exames/api/createSpecialistReport';

vi.mock('@/features/historico-exames/api/createSpecialistReport', () => ({
  createSpecialistReport: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false },
      mutations: { retry: false } 
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('useCreateSpecialistReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve submeter o laudo com sucesso e invalidar as queries do exame', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    
    const mockPayload = {
      examId: '12345678-1234-1234-1234-1234567890ab',
      texto: 'Laudo normal',
      html: '<p>Laudo normal</p>',
      json: {},
      resultadoIaValido: true,
    };

    vi.mocked(createSpecialistReport).mockResolvedValueOnce({ 
      id: 'report-1',
      examId: '12345678-1234-1234-1234-1234567890ab',
      specialistId: 'spec-1',
      texto: 'Laudo normal',
      html: '<p>Laudo normal</p>',
      json: {},
      resultadoIaValido: true,
      createdAt: '',
      updatedAt: ''
    });

    const { result } = renderHook(() => useCreateSpecialistReport(), { wrapper });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createSpecialistReport).toHaveBeenCalledWith(mockPayload);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['resultado-exame', '12345678-1234-1234-1234-1234567890ab'],
    });
  });
});