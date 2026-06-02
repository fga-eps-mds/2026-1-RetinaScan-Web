import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { api } from '@/shared/api';
import { resetPassword } from '@/features/auth/api/resetPassword';
vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar o endpoint correto e retornar os dados em caso de sucesso', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        message: 'Senha redefinida com sucesso',
      },
    });

    const result = await resetPassword({
      token: 'token-123',
      newPassword: 'novaSenha123',
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/reset-password', {
      token: 'token-123',
      newPassword: 'novaSenha123',
    });

    expect(result).toEqual({
      success: true,
      message: 'Senha redefinida com sucesso',
    });
  });

  it('deve lançar a mensagem vinda da API quando for AxiosError', async () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          message: 'Token inválido ou expirado',
        },
      },
    };

    vi.mocked(api.post).mockRejectedValue(error);

    await expect(
      resetPassword({
        token: 'token-invalido',
        newPassword: 'novaSenha123',
      })
    ).rejects.toThrow('Token inválido ou expirado');
  });

  it('deve lançar mensagem padrão quando for AxiosError sem message', async () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {},
      },
    };

    vi.mocked(api.post).mockRejectedValue(error);

    await expect(
      resetPassword({
        token: 'token-123',
        newPassword: 'novaSenha123',
      })
    ).rejects.toThrow('Não foi possível redefinir a senha.');
  });

  it('deve lançar erro genérico quando não for AxiosError', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network'));

    await expect(
      resetPassword({
        token: 'token-123',
        newPassword: 'novaSenha123',
      })
    ).rejects.toThrow('Erro de rede ou servidor');
  });
});
