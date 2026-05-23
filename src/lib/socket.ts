import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  return socket;
}

export function connectSocket() {
  if (socket?.connected) {
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;

  socket.disconnect();
  socket = null;
}
