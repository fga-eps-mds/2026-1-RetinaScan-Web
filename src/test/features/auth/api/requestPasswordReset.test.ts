import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/shared/api';
import { requestPasswordRecovery } from '@/features/auth/api/requestPasswordReset';

vi.mock('@/shared/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('requestPasswordRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia recuperação por email com redirectTo correto', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        message: 'Email enviado com sucesso',
      },
    });

    const result = await requestPasswordRecovery({
      type: 'email',
      value: 'gustavo@email.com',
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/request-password-reset', {
      email: 'gustavo@email.com',
      redirectTo: `${window.location.origin}/reset-password`,
    });

    expect(result).toEqual({
      message: 'Email enviado com sucesso',
    });
  });

  it('faz trim no email antes de enviar', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        message: 'Email enviado com sucesso',
      },
    });

    await requestPasswordRecovery({
      type: 'email',
      value: '   gustavo@email.com   ',
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/request-password-reset', {
      email: 'gustavo@email.com',
      redirectTo: `${window.location.origin}/reset-password`,
    });
  });

  it('envia recuperação por crm normalizado', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        message: 'CRM processado com sucesso',
      },
    });

    const result = await requestPasswordRecovery({
      type: 'crm',
      value: 'crm 12345-df',
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/recover-by-crm', {
      crm: 'CRM 12345-DF',
      redirectTo: `${window.location.origin}/reset-password`,
    });

    expect(result).toEqual({
      message: 'CRM processado com sucesso',
    });
  });

  it('normaliza crm com espaços extras', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        message: 'CRM processado com sucesso',
      },
    });

    await requestPasswordRecovery({
      type: 'crm',
      value: '  crm   12345-df  ',
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/recover-by-crm', {
      crm: 'CRM 12345-DF',
      redirectTo: `${window.location.origin}/reset-password`,
    });
  });

  it('propaga erro da api no fluxo de email', async () => {
    const error = new Error('Erro na API');
    vi.mocked(api.post).mockRejectedValue(error);

    await expect(
      requestPasswordRecovery({
        type: 'email',
        value: 'gustavo@email.com',
      })
    ).rejects.toThrow('Erro na API');
  });

  it('propaga erro da api no fluxo de crm', async () => {
    const error = new Error('Erro na API');
    vi.mocked(api.post).mockRejectedValue(error);

    await expect(
      requestPasswordRecovery({
        type: 'crm',
        value: 'crm 12345-df',
      })
    ).rejects.toThrow('Erro na API');
  });
});
