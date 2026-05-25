// src/test/features/notificacoes/api/listMyNotifications.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api';
import {
  listMyNotifications,
  type NotificationItem,
} from '@/features/notificacoes/api/listMyNotifications';

describe('listMyNotifications', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve buscar notificações sem query string quando nenhum parâmetro for informado', async () => {
    const responseData: NotificationItem[] = [
      {
        id: '1',
        tipo: 'avaliacao_ia_atualizada',
        titulo: 'Nova avaliação',
        mensagem: 'A avaliação foi atualizada.',
        dados: null,
        lidaEm: null,
        createdAt: '2026-05-23T12:00:00.000Z',
      },
    ];

    const getSpy = vi
      .spyOn(api, 'get')
      .mockResolvedValue({ data: responseData } as any);

    const result = await listMyNotifications({});

    expect(getSpy).toHaveBeenCalledWith('/api/notifications/me');
    expect(result).toEqual(responseData);
  });

  it('deve montar a query string com status, tipo e limit', async () => {
    const responseData: NotificationItem[] = [];

    const getSpy = vi
      .spyOn(api, 'get')
      .mockResolvedValue({ data: responseData } as any);

    await listMyNotifications({
      status: 'nao-lidas',
      tipo: 'avaliacao_ia_atualizada',
      limit: 10,
    });

    expect(getSpy).toHaveBeenCalledWith(
      '/api/notifications/me?status=nao-lidas&tipo=avaliacao_ia_atualizada&limit=10'
    );
  });

  it('deve montar a query string apenas com os parâmetros informados', async () => {
    const responseData: NotificationItem[] = [];

    const getSpy = vi
      .spyOn(api, 'get')
      .mockResolvedValue({ data: responseData } as any);

    await listMyNotifications({
      status: 'lidas',
    });

    expect(getSpy).toHaveBeenCalledWith('/api/notifications/me?status=lidas');
  });

  it('deve ignorar limit quando for 0', async () => {
    const responseData: NotificationItem[] = [];

    const getSpy = vi
      .spyOn(api, 'get')
      .mockResolvedValue({ data: responseData } as any);

    await listMyNotifications({
      status: 'todas',
      limit: 0,
    });

    expect(getSpy).toHaveBeenCalledWith('/api/notifications/me?status=todas');
  });

  it('deve retornar os dados da resposta da api', async () => {
    const responseData: NotificationItem[] = [
      {
        id: '1',
        tipo: 'avaliacao_ia_atualizada',
        titulo: 'Nova avaliação',
        mensagem: 'A avaliação foi atualizada.',
        dados: { exameId: 'abc' },
        lidaEm: null,
        createdAt: '2026-05-23T12:00:00.000Z',
      },
      {
        id: '2',
        tipo: 'avaliacao_ia_revisada_por_especialista',
        titulo: 'Revisão concluída',
        mensagem: 'A revisão foi concluída.',
        dados: null,
        lidaEm: '2026-05-23T13:00:00.000Z',
        createdAt: '2026-05-23T11:00:00.000Z',
      },
    ];

    vi.spyOn(api, 'get').mockResolvedValue({ data: responseData } as any);

    const result = await listMyNotifications({
      tipo: 'avaliacao_ia_revisada_por_especialista',
    });

    expect(result).toEqual(responseData);
  });
});
