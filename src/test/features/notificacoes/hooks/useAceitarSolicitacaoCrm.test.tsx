import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAceitarSolicitacaoCrm } from '@/features/notificacoes/hooks/useAceitarSolicitacaoCrm';
import { aceitarSolicitacaoCrm } from '@/features/notificacoes/api/aprovarSolicitacaoCrm';
import { notificacaoKeys } from '@/features/notificacoes/api/queryKeys';

vi.mock('@/features/notificacoes/api/aprovarSolicitacaoCrm', () => ({
  aceitarSolicitacaoCrm: vi.fn(),
}));

describe('useAceitarSolicitacaoCrm', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve chamar aceitarSolicitacaoCrm e invalidar as queries ao ter sucesso', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    
    // Ajuste aqui: cast explícito para Mock
    (aceitarSolicitacaoCrm as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAceitarSolicitacaoCrm(), { wrapper });

    result.current.mutate('123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(aceitarSolicitacaoCrm).toHaveBeenCalledWith('123');
    
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: notificacaoKeys.solicitacoesCpfCrmList,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: notificacaoKeys.minhasSolicitacoesCpfCrm,
    });
  });
});