// src/test/shared/lib/socket.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ioMock = vi.fn();

vi.mock('socket.io-client', () => ({
  io: ioMock,
}));

describe('socket service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('getSocket deve retornar null antes de conectar', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3333');

    const { getSocket } = await import('@/lib/socket');

    expect(getSocket()).toBeNull();
  });

  it('connectSocket deve criar conexão com as opções corretas', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3333');

    const socketMock = {
      connected: false,
      disconnect: vi.fn(),
    };

    ioMock.mockReturnValue(socketMock);

    const { connectSocket, getSocket } = await import('@/lib/socket');

    const result = connectSocket();

    expect(ioMock).toHaveBeenCalledWith('http://localhost:3333', {
      withCredentials: true,
      autoConnect: true,
    });
    expect(result).toBe(socketMock);
    expect(getSocket()).toBe(socketMock);
  });

  it('connectSocket deve reutilizar o socket conectado', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3333');

    const socketMock = {
      connected: false,
      disconnect: vi.fn(),
    };

    ioMock.mockReturnValue(socketMock);

    const { connectSocket } = await import('@/lib/socket');

    const firstSocket = connectSocket();
    socketMock.connected = true;

    const secondSocket = connectSocket();

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(secondSocket).toBe(firstSocket);
  });

  it('disconnectSocket deve desconectar e limpar a instância', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3333');

    const socketMock = {
      connected: false,
      disconnect: vi.fn(),
    };

    ioMock.mockReturnValue(socketMock);

    const { connectSocket, disconnectSocket, getSocket } =
      await import('@/lib/socket');

    connectSocket();
    disconnectSocket();

    expect(socketMock.disconnect).toHaveBeenCalledTimes(1);
    expect(getSocket()).toBeNull();
  });

  it('disconnectSocket não deve falhar quando não existe socket', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3333');

    const { disconnectSocket } = await import('@/lib/socket');

    expect(() => disconnectSocket()).not.toThrow();
  });

  it('deve recriar o socket se existir instância mas não estiver conectada', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3333');

    const firstSocketMock = {
      connected: false,
      disconnect: vi.fn(),
    };

    const secondSocketMock = {
      connected: false,
      disconnect: vi.fn(),
    };

    ioMock
      .mockReturnValueOnce(firstSocketMock)
      .mockReturnValueOnce(secondSocketMock);

    const { connectSocket } = await import('@/lib/socket');

    const first = connectSocket();
    const second = connectSocket();

    expect(ioMock).toHaveBeenCalledTimes(2);
    expect(first).toBe(firstSocketMock);
    expect(second).toBe(secondSocketMock);
  });
});
