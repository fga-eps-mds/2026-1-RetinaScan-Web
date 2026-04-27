import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateSolicitacaoCpfCrm } from '@/features/usuario/hooks/useCreateSolicitacaoCpfCrm';
import { createSolicitacaoCpfCrm } from '@/features/usuario/api/createSolicitacaoCpfCrm';
import { userKeys } from '@/features/usuario/api/queryKeys';

vi.mock('@/features/usuario/api/createSolicitacaoCpfCrm', () => ({
  createSolicitacaoCpfCrm: vi.fn(),
}));

describe('useCreateSolicitacaoCpfCrm (Feature: Usuário)', () => {
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

  it('deve chamar createSolicitacaoCpfCrm e invalidar as queries de perfil e solicitações no sucesso', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const mockPayload = { cpfNovo: '123.456.789-00', crmNovo: '123456/SP' };
    
    (createSolicitacaoCpfCrm as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCreateSolicitacaoCpfCrm(), { wrapper });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Ajustado para aceitar o objeto de contexto do React Query como segundo argumento
    expect(createSolicitacaoCpfCrm).toHaveBeenCalledWith(
      expect.objectContaining(mockPayload),
      expect.anything()
    );
    
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: userKeys.solicitacoesCpfCrm,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: userKeys.profile,
    });
  });

  it('deve lidar com erro na criação da solicitação', async () => {
    (createSolicitacaoCpfCrm as any).mockRejectedValue(new Error('Erro na API de Usuário'));

    const { result } = renderHook(() => useCreateSolicitacaoCpfCrm(), { wrapper });

    result.current.mutate({ cpfNovo: '1', crmNovo: '1' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Erro na API de Usuário'));
  });
});