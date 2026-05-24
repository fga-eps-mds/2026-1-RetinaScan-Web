// src/test/features/notificacoes/api/notificationsQueryKey.test.ts
import { describe, expect, it } from 'vitest';
import { notificationsQueryKey } from '@/features/notificacoes/api/notificationsQueryKey';

describe('notificationsQueryKey', () => {
  it('deve retornar a query key com os filtros informados', () => {
    const filters = {
      status: 'nao-lidas' as const,
      tipo: 'avaliacao_ia_atualizada' as const,
      limit: 10,
    };

    expect(notificationsQueryKey(filters)).toEqual(['notifications', filters]);
  });

  it('deve retornar objeto vazio quando nenhum filtro for informado', () => {
    expect(notificationsQueryKey()).toEqual(['notifications', {}]);
  });

  it('deve retornar a chave base de notifications como primeiro item', () => {
    const result = notificationsQueryKey({ status: 'todas' });

    expect(result[0]).toBe('notifications');
  });

  it('deve manter a referência do objeto de filtros recebido', () => {
    const filters = {
      status: 'lidas' as const,
      limit: 20,
    };

    const result = notificationsQueryKey(filters);

    expect(result[1]).toBe(filters);
  });
});
