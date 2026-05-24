// src/test/features/notificacoes/api/deleteNotification.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api';
import { deleteNotification } from '@/features/notificacoes/api/deleteNotification';

describe('deleteNotification', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve chamar a rota correta para remover a notificação', async () => {
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValue({} as any);

    await deleteNotification('notif-123');

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith('/api/notifications/notif-123');
  });

  it('deve resolver sem retornar valor', async () => {
    vi.spyOn(api, 'delete').mockResolvedValue({} as any);

    await expect(deleteNotification('notif-123')).resolves.toBeUndefined();
  });

  it('deve propagar erro da api', async () => {
    vi.spyOn(api, 'delete').mockRejectedValue(new Error('Erro na requisição'));

    await expect(deleteNotification('notif-123')).rejects.toThrow(
      'Erro na requisição'
    );
  });
});
