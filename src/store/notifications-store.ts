import { create } from 'zustand';

export type TipoNotificacao =
  | 'avaliacao_ia_atualizada'
  | 'avaliacao_ia_revisada_por_especialista'
  | 'status_solicitacao_cadastral_atualizado';

export type Notificacao = {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  dados: Record<string, unknown> | null;
  lidaEm: string | null;
  createdAt: string;
};

type FiltroNotificacao = 'todas' | 'nao-lidas' | 'novas';

type NotificationsStore = {
  notificacoes: Notificacao[];
  filtro: FiltroNotificacao;
  adicionarNotificacao: (notificacao: Notificacao) => void;
  definirNotificacoes: (notificacoes: Notificacao[]) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  definirFiltro: (filtro: FiltroNotificacao) => void;
};

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notificacoes: [],
  filtro: 'todas',

  adicionarNotificacao: (notificacao) =>
    set((state) => {
      const jaExiste = state.notificacoes.some(
        (item) => item.id === notificacao.id
      );

      if (jaExiste) {
        return state;
      }

      return {
        notificacoes: [notificacao, ...state.notificacoes],
      };
    }),

  definirNotificacoes: (notificacoes) =>
    set({
      notificacoes,
    }),

  marcarComoLida: (id) =>
    set((state) => ({
      notificacoes: state.notificacoes.map((notificacao) =>
        notificacao.id === id
          ? {
              ...notificacao,
              lidaEm: new Date().toISOString(),
            }
          : notificacao
      ),
    })),

  marcarTodasComoLidas: () =>
    set((state) => ({
      notificacoes: state.notificacoes.map((notificacao) => ({
        ...notificacao,
        lidaEm: notificacao.lidaEm ?? new Date().toISOString(),
      })),
    })),

  definirFiltro: (filtro) =>
    set({
      filtro,
    }),
}));
