// src/test/features/notificacoes/stores/notificationsStore.test.ts
import {
  useNotificationsStore,
  type Notificacao,
} from '@/store/notifications-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const initialState = useNotificationsStore.getInitialState();

const notificacaoBase = (overrides?: Partial<Notificacao>): Notificacao => ({
  id: '1',
  tipo: 'avaliacao_ia_atualizada',
  titulo: 'Nova avaliação',
  mensagem: 'A avaliação foi atualizada.',
  dados: null,
  lidaEm: null,
  createdAt: '2026-05-23T12:00:00.000Z',
  ...overrides,
});

describe('useNotificationsStore', () => {
  beforeEach(() => {
    useNotificationsStore.setState(initialState, true);
    vi.useRealTimers();
  });

  it('deve iniciar com notificações vazias e filtro "todas"', () => {
    const state = useNotificationsStore.getState();

    expect(state.notificacoes).toEqual([]);
    expect(state.filtro).toBe('todas');
  });

  it('deve adicionar uma notificação no início da lista', () => {
    const notificacao = notificacaoBase();

    useNotificationsStore.getState().adicionarNotificacao(notificacao);

    const { notificacoes } = useNotificationsStore.getState();

    expect(notificacoes).toHaveLength(1);
    expect(notificacoes[0]).toEqual(notificacao);
  });

  it('não deve adicionar notificação duplicada pelo mesmo id', () => {
    const notificacao = notificacaoBase();

    useNotificationsStore.getState().adicionarNotificacao(notificacao);
    useNotificationsStore.getState().adicionarNotificacao(notificacao);

    const { notificacoes } = useNotificationsStore.getState();

    expect(notificacoes).toHaveLength(1);
  });

  it('deve manter a nova notificação no topo da lista', () => {
    const primeira = notificacaoBase({ id: '1', titulo: 'Primeira' });
    const segunda = notificacaoBase({ id: '2', titulo: 'Segunda' });

    useNotificationsStore.getState().adicionarNotificacao(primeira);
    useNotificationsStore.getState().adicionarNotificacao(segunda);

    const { notificacoes } = useNotificationsStore.getState();

    expect(notificacoes.map((item) => item.id)).toEqual(['2', '1']);
  });

  it('deve definir a lista completa de notificações', () => {
    const notificacoes = [
      notificacaoBase({ id: '1' }),
      notificacaoBase({
        id: '2',
        tipo: 'avaliacao_ia_revisada_por_especialista',
      }),
    ];

    useNotificationsStore.getState().definirNotificacoes(notificacoes);

    expect(useNotificationsStore.getState().notificacoes).toEqual(notificacoes);
  });

  it('deve marcar uma notificação como lida', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T15:00:00.000Z'));

    useNotificationsStore
      .getState()
      .definirNotificacoes([
        notificacaoBase({ id: '1', lidaEm: null }),
        notificacaoBase({ id: '2', lidaEm: null }),
      ]);

    useNotificationsStore.getState().marcarComoLida('1');

    const { notificacoes } = useNotificationsStore.getState();

    expect(notificacoes[0].lidaEm).toBe('2026-05-23T15:00:00.000Z');
    expect(notificacoes[1].lidaEm).toBeNull();
  });

  it('não deve alterar notificações com id diferente ao marcar como lida', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T15:00:00.000Z'));

    useNotificationsStore
      .getState()
      .definirNotificacoes([
        notificacaoBase({ id: '1', lidaEm: null }),
        notificacaoBase({ id: '2', lidaEm: '2026-05-22T10:00:00.000Z' }),
      ]);

    useNotificationsStore.getState().marcarComoLida('1');

    const { notificacoes } = useNotificationsStore.getState();

    expect(notificacoes[0].lidaEm).toBe('2026-05-23T15:00:00.000Z');
    expect(notificacoes[1].lidaEm).toBe('2026-05-22T10:00:00.000Z');
  });

  it('deve marcar todas como lidas sem sobrescrever quem já foi lida', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T16:30:00.000Z'));

    useNotificationsStore
      .getState()
      .definirNotificacoes([
        notificacaoBase({ id: '1', lidaEm: null }),
        notificacaoBase({ id: '2', lidaEm: '2026-05-20T09:00:00.000Z' }),
      ]);

    useNotificationsStore.getState().marcarTodasComoLidas();

    const { notificacoes } = useNotificationsStore.getState();

    expect(notificacoes[0].lidaEm).toBe('2026-05-23T16:30:00.000Z');
    expect(notificacoes[1].lidaEm).toBe('2026-05-20T09:00:00.000Z');
  });

  it('deve definir o filtro corretamente', () => {
    useNotificationsStore.getState().definirFiltro('nao-lidas');

    expect(useNotificationsStore.getState().filtro).toBe('nao-lidas');

    useNotificationsStore.getState().definirFiltro('novas');

    expect(useNotificationsStore.getState().filtro).toBe('novas');
  });
});
