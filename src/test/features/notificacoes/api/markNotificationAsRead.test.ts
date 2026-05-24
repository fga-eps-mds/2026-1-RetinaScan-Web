// src/test/features/notificacoes/api/markNotificationAsRead.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api';
import { markNotificationAsRead } from '@/features/notificacoes/api/markNotificationAsRead';

describe('markNotificationAsRead', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve chamar a rota correta para marcar a notificação como lida', async () => {
    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({} as any);

    await markNotificationAsRead('notif-123');

    expect(patchSpy).toHaveBeenCalledTimes(1);
    expect(patchSpy).toHaveBeenCalledWith('/api/notifications/notif-123/read');
  });

  it('deve resolver sem retornar valor', async () => {
    vi.spyOn(api, 'patch').mockResolvedValue({} as any);

    await expect(markNotificationAsRead('notif-123')).resolves.toBeUndefined();
  });

  it('deve propagar erro da api', async () => {
    vi.spyOn(api, 'patch').mockRejectedValue(new Error('Erro na requisição'));

    await expect(markNotificationAsRead('notif-123')).rejects.toThrow(
      'Erro na requisição'
    );
  });
});
