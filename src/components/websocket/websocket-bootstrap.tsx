import { authClient } from '@/lib/auth-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useSocketStore } from '@/store/socket-store';
import { useEffect } from 'react';
import type { NotificationItem } from '@/features/notificacoes/api/listMyNotifications';
import { useQueryClient } from '@tanstack/react-query';
import { useSound } from '@/shared/hooks/useSound';
import notificationSound from '../../assets/sounds/notification/notification-pop.mp3';

type NotificationPayload = {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  dados: Record<string, unknown> | null;
  lidaEm: string | null;
  createdAt: string;
};

export function WebSocketBootStrap() {
  const { data: session, isPending } = authClient.useSession();

  const queryClient = useQueryClient();

  const setStatus = useSocketStore((state) => state.setStatus);
  const setSocketId = useSocketStore((state) => state.setSocketId);
  const setErro = useSocketStore((state) => state.setErro);
  const reset = useSocketStore((state) => state.reset);

  const notificationPlayer = useSound(notificationSound, { volume: 0.5 });

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      disconnectSocket();
      reset();
      return;
    }

    setStatus('conectando');

    const socket = connectSocket();

    const onConnect = () => {
      console.log('[ws] connect', socket.id);
      setStatus('conectado');
      setSocketId(socket.id ?? null);
      setErro(null);
    };

    const onDisconnect = (reason: string) => {
      console.log('[ws] disconnect', reason);
      setStatus('desconectado');
      setSocketId(null);
    };

    const onConnectError = (err: Error) => {
      console.log('[ws] connect_error', err.message);
      setStatus('erro');
      setErro(err.message);
    };

    const onNotificationNew = (payload: NotificationPayload) => {
      console.log('[ws] notification:new RECEBIDA', payload);
      queryClient.setQueriesData(
        { queryKey: ['notifications'] },
        (oldData: NotificationItem[] | undefined) => {
          console.log('[ws] oldData', oldData);

          if (!oldData) return [payload as NotificationItem];

          const alreadyExists = oldData.some((item) => item.id === payload.id);
          if (alreadyExists) return oldData;

          return [payload as NotificationItem, ...oldData];
        }
      );

      notificationPlayer.play();
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('notification:new', onNotificationNew);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('notification:new', onNotificationNew);
    };
  }, [
    session,
    isPending,
    setStatus,
    setSocketId,
    setErro,
    reset,
    queryClient,
    notificationPlayer,
  ]);

  return null;
}
