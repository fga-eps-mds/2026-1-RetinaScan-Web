import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResetPassword } from '@/features/auth/hooks/usePasswordReset';
import { resetPassword } from '@/features/auth/api/resetPassword';

vi.mock('@/features/auth/api/resetPassword', () => ({
  resetPassword: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
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

describe('useResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('chama resetPassword com os dados corretos e retorna sucesso', async () => {
    vi.mocked(resetPassword).mockResolvedValue({
      success: true,
      message: 'Senha redefinida com sucesso',
    });

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        token: 'token-123',
        newPassword: 'novaSenha123',
      });
    });

    expect(resetPassword).toHaveBeenCalledWith({
      token: 'token-123',
      newPassword: 'novaSenha123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      success: true,
      message: 'Senha redefinida com sucesso',
    });
  });

  it('propaga erro quando resetPassword falha', async () => {
    vi.mocked(resetPassword).mockRejectedValue(
      new Error('Token inválido ou expirado')
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          token: 'token-invalido',
          newPassword: 'novaSenha123',
        })
      ).rejects.toThrow('Token inválido ou expirado');
    });

    expect(resetPassword).toHaveBeenCalledWith({
      token: 'token-invalido',
      newPassword: 'novaSenha123',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Token inválido ou expirado');
  });
});
