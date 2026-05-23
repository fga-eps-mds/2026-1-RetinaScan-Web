import { create } from 'zustand';

type SocketStatus = 'desconectado' | 'conectando' | 'conectado' | 'erro';

type SocketStore = {
  status: SocketStatus;
  socketId: string | null;
  erro: string | null;
  setStatus: (status: SocketStatus) => void;
  setSocketId: (socketId: string | null) => void;
  setErro: (erro: string | null) => void;
  reset: () => void;
};

export const useSocketStore = create<SocketStore>((set) => ({
  status: 'desconectado',
  socketId: null,
  erro: null,
  setStatus: (status) => set({ status }),
  setSocketId: (socketId) => set({ socketId }),
  setErro: (erro) => set({ erro }),
  reset: () =>
    set({
      status: 'desconectado',
      socketId: null,
      erro: null,
    }),
}));
