// src/test/shared/stores/socketStore.test.ts
import { useSocketStore } from '@/store/socket-store';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useSocketStore', () => {
  beforeEach(() => {
    useSocketStore.setState(useSocketStore.getInitialState(), true);
  });

  it('deve iniciar com o estado padrão', () => {
    const state = useSocketStore.getState();

    expect(state.status).toBe('desconectado');
    expect(state.socketId).toBeNull();
    expect(state.erro).toBeNull();
  });

  it('deve atualizar o status', () => {
    useSocketStore.getState().setStatus('conectando');

    expect(useSocketStore.getState().status).toBe('conectando');

    useSocketStore.getState().setStatus('conectado');

    expect(useSocketStore.getState().status).toBe('conectado');
  });

  it('deve atualizar o socketId', () => {
    useSocketStore.getState().setSocketId('socket-123');

    expect(useSocketStore.getState().socketId).toBe('socket-123');

    useSocketStore.getState().setSocketId(null);

    expect(useSocketStore.getState().socketId).toBeNull();
  });

  it('deve atualizar o erro', () => {
    useSocketStore.getState().setErro('Falha na conexão');

    expect(useSocketStore.getState().erro).toBe('Falha na conexão');

    useSocketStore.getState().setErro(null);

    expect(useSocketStore.getState().erro).toBeNull();
  });

  it('deve resetar todo o estado', () => {
    const store = useSocketStore.getState();

    store.setStatus('erro');
    store.setSocketId('socket-123');
    store.setErro('Falha na autenticação');

    store.reset();

    const state = useSocketStore.getState();

    expect(state.status).toBe('desconectado');
    expect(state.socketId).toBeNull();
    expect(state.erro).toBeNull();
  });
});
