// src/test/components/websocket/websocket-bootstrap.test.tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { authClient } from '@/lib/auth-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useSocketStore } from '@/store/socket-store';
import { useSound } from '@/shared/hooks/useSound';
import { WebSocketBootStrap } from '@/components/websocket/websocket-bootstrap';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

vi.mock('@/lib/socket', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}));

vi.mock('@/store/socket-store', () => ({
  useSocketStore: vi.fn(),
}));

vi.mock('@/shared/hooks/useSound', () => ({
  useSound: vi.fn(),
}));

vi.mock('@/assets/sounds/notification/notification-pop.mp3', () => ({
  default: 'notification-pop.mp3',
}));

type SocketHandlers = Record<string, (...args: any[]) => void>;

describe('WebSocketBootStrap', () => {
  let queryClient: QueryClient;
  let handlers: SocketHandlers;

  const setStatus = vi.fn();
  const setSocketId = vi.fn();
  const setErro = vi.fn();
  const reset = vi.fn();
  const play = vi.fn();

  const socketMock = {
    id: 'socket-123',
    on: vi.fn((event: string, cb: (...args: any[]) => void) => {
      handlers[event] = cb;
      return socketMock;
    }),
    off: vi.fn(),
  };

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <WebSocketBootStrap />
      </QueryClientProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    handlers = {};

    vi.mocked(useSound).mockReturnValue({ play });
    vi.mocked(connectSocket).mockReturnValue(socketMock as any);

    vi.mocked(useSocketStore).mockImplementation((selector: any) =>
      selector({
        setStatus,
        setSocketId,
        setErro,
        reset,
      })
    );
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('não deve conectar enquanto a sessão estiver pending', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: true,
    } as any);

    renderComponent();

    expect(connectSocket).not.toHaveBeenCalled();
    expect(disconnectSocket).not.toHaveBeenCalled();
  });

  it('deve desconectar e resetar quando não houver usuário logado', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as any);

    renderComponent();

    expect(disconnectSocket).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(connectSocket).not.toHaveBeenCalled();
  });

  it('deve conectar e registrar os handlers quando houver usuário logado', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    renderComponent();

    expect(setStatus).toHaveBeenCalledWith('conectando');
    expect(connectSocket).toHaveBeenCalledTimes(1);
    expect(socketMock.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socketMock.on).toHaveBeenCalledWith(
      'disconnect',
      expect.any(Function)
    );
    expect(socketMock.on).toHaveBeenCalledWith(
      'connect_error',
      expect.any(Function)
    );
    expect(socketMock.on).toHaveBeenCalledWith(
      'notification:new',
      expect.any(Function)
    );
  });

  it('deve atualizar o store ao conectar', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    renderComponent();

    handlers.connect();

    expect(setStatus).toHaveBeenCalledWith('conectado');
    expect(setSocketId).toHaveBeenCalledWith('socket-123');
    expect(setErro).toHaveBeenCalledWith(null);
  });

  it('deve atualizar o store ao desconectar', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    renderComponent();

    handlers.disconnect('transport close');

    expect(setStatus).toHaveBeenCalledWith('desconectado');
    expect(setSocketId).toHaveBeenCalledWith(null);
  });

  it('deve atualizar o store em caso de connect_error', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    renderComponent();

    handlers.connect_error(new Error('Falha ao conectar'));

    expect(setStatus).toHaveBeenCalledWith('erro');
    expect(setErro).toHaveBeenCalledWith('Falha ao conectar');
  });

  it('deve inserir nova notificação no cache e tocar som quando a query já existir', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    queryClient.setQueryData(
      ['notifications'],
      [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Antiga',
          mensagem: 'Mensagem antiga',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T10:00:00.000Z',
        },
      ]
    );

    renderComponent();

    handlers['notification:new']({
      id: '2',
      tipo: 'avaliacao_ia_atualizada',
      titulo: 'Nova',
      mensagem: 'Mensagem nova',
      dados: null,
      lidaEm: null,
      createdAt: '2026-05-23T11:00:00.000Z',
    });

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      {
        id: '2',
        tipo: 'avaliacao_ia_atualizada',
        titulo: 'Nova',
        mensagem: 'Mensagem nova',
        dados: null,
        lidaEm: null,
        createdAt: '2026-05-23T11:00:00.000Z',
      },
      {
        id: '1',
        tipo: 'avaliacao_ia_atualizada',
        titulo: 'Antiga',
        mensagem: 'Mensagem antiga',
        dados: null,
        lidaEm: null,
        createdAt: '2026-05-23T10:00:00.000Z',
      },
    ]);

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('não deve criar a lista no cache quando não houver query pré-existente', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    renderComponent();

    handlers['notification:new']({
      id: '1',
      tipo: 'avaliacao_ia_atualizada',
      titulo: 'Nova',
      mensagem: 'Mensagem nova',
      dados: null,
      lidaEm: null,
      createdAt: '2026-05-23T11:00:00.000Z',
    });

    expect(queryClient.getQueryData(['notifications'])).toBeUndefined();
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('não deve duplicar notificação já existente no cache', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    queryClient.setQueryData(
      ['notifications'],
      [
        {
          id: '1',
          tipo: 'avaliacao_ia_atualizada',
          titulo: 'Existente',
          mensagem: 'Mensagem existente',
          dados: null,
          lidaEm: null,
          createdAt: '2026-05-23T10:00:00.000Z',
        },
      ]
    );

    renderComponent();

    handlers['notification:new']({
      id: '1',
      tipo: 'avaliacao_ia_atualizada',
      titulo: 'Existente',
      mensagem: 'Mensagem existente',
      dados: null,
      lidaEm: null,
      createdAt: '2026-05-23T10:00:00.000Z',
    });

    expect(queryClient.getQueryData(['notifications'])).toEqual([
      {
        id: '1',
        tipo: 'avaliacao_ia_atualizada',
        titulo: 'Existente',
        mensagem: 'Mensagem existente',
        dados: null,
        lidaEm: null,
        createdAt: '2026-05-23T10:00:00.000Z',
      },
    ]);

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('deve remover os listeners no unmount', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'user-1' } },
      isPending: false,
    } as any);

    const { unmount } = renderComponent();

    unmount();

    expect(socketMock.off).toHaveBeenCalledWith(
      'connect',
      expect.any(Function)
    );
    expect(socketMock.off).toHaveBeenCalledWith(
      'disconnect',
      expect.any(Function)
    );
    expect(socketMock.off).toHaveBeenCalledWith(
      'connect_error',
      expect.any(Function)
    );
    expect(socketMock.off).toHaveBeenCalledWith(
      'notification:new',
      expect.any(Function)
    );
  });
});
