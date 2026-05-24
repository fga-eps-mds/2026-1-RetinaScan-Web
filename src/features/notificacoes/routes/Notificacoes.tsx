import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SolicitacoesMedico from '../components/SolicitacoesMedico';
import SolicitacoesAdmin from '../components/SolicitacoesAdmin';
import { useSession } from '@/lib/auth-client';
import type { NotificationStatusFilter } from '../api/listMyNotifications';
import { useListNotifications } from '../hooks/useListNotifications';
import { NotificationCard } from '../components/NotificationCard';
import { NotificationCardSkeleton } from '../components/NotificationCardSkeleton';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useDeleteNotification } from '../hooks/useDeleteNotification';

const SolicitacoesMap = {
  ADMIN: <SolicitacoesAdmin />,
  MEDICO: <SolicitacoesMedico />,
};

type LocalFilter = 'todas' | 'nao-lidas' | 'novas';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const userTipoPerfil = session?.user?.tipoPerfil;

  const [tabFiltro, setTabFiltro] = useState<LocalFilter>('todas');

  const apiStatusFilter: NotificationStatusFilter =
    tabFiltro === 'nao-lidas' ? 'nao-lidas' : 'todas';

  const {
    data: notificacoes = [],
    isLoading,
    isFetching,
  } = useListNotifications({
    status: apiStatusFilter,
    limit: 50,
  });

  const { mutate: markAsRead, isPending: isMarkingAllRead } =
    useMarkNotificationAsRead();

  const { mutate: removeNotification, isPending: isRemovingNotification } =
    useDeleteNotification();

  const notificacoesOrdenadas = useMemo(() => {
    return [...notificacoes].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notificacoes]);

  const notificacoesFiltradas = useMemo(() => {
    if (tabFiltro !== 'novas') return notificacoesOrdenadas;

    // eslint-disable-next-line react-hooks/purity
    const agora = Date.now();
    const vinteQuatroHoras = 1000 * 60 * 60 * 24;

    return notificacoesOrdenadas.filter(
      (notificacao) =>
        agora - new Date(notificacao.createdAt).getTime() <= vinteQuatroHoras
    );
  }, [tabFiltro, notificacoesOrdenadas]);

  const unreadCount = useMemo(
    () => notificacoesOrdenadas.filter((item) => !item.lidaEm).length,
    [notificacoesOrdenadas]
  );

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleRemove = (id: string) => {
    removeNotification(id);
  };

  const handleMarkAllAsRead = () => {
    notificacoesOrdenadas
      .filter((item) => !item.lidaEm)
      .forEach((item) => markAsRead(item.id));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden px-6 py-8 sm:px-10 lg:px-12">
      <Tabs defaultValue="alertas" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-fit shrink-0">
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
        </TabsList>

        <TabsContent
          value="alertas"
          className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
            <header className="shrink-0 text-center">
              <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                Notificações
              </h2>
              <p className="text-md text-muted-foreground">
                Acompanhe alertas clínicos, atualizações da fila e eventos do
                sistema.
              </p>
            </header>

            <div className="flex shrink-0 items-center justify-between border-t border-border/60 px-3 py-4">
              <Tabs
                value={tabFiltro}
                onValueChange={(value) => setTabFiltro(value as LocalFilter)}
              >
                <TabsList>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="nao-lidas">
                    Não lidas {unreadCount > 0 ? `(${unreadCount})` : ''}
                  </TabsTrigger>
                  <TabsTrigger value="novas">Novas</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || isMarkingAllRead}
              >
                Marcar todas como lidas
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-transparent">
              <div className="space-y-3">
                {isLoading ? (
                  <>
                    <NotificationCardSkeleton />
                    <NotificationCardSkeleton />
                    <NotificationCardSkeleton />
                  </>
                ) : notificacoesFiltradas.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                    Nenhuma notificação encontrada.
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {notificacoesFiltradas.map((notificacao) => (
                      <NotificationCard
                        key={notificacao.id}
                        id={notificacao.id}
                        type={notificacao.tipo}
                        title={notificacao.titulo}
                        description={notificacao.mensagem}
                        time={new Date(notificacao.createdAt).toLocaleString(
                          'pt-BR'
                        )}
                        unread={!notificacao.lidaEm}
                        onMarkAsRead={handleMarkAsRead}
                        onRemove={handleRemove}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {isFetching && !isLoading && (
                <div className="pt-3 text-center text-xs text-muted-foreground">
                  Atualizando notificações...
                </div>
              )}

              {isRemovingNotification && (
                <div className="pt-3 text-center text-xs text-muted-foreground">
                  Removendo notificação...
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="solicitacoes"
          className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
            <header className="shrink-0 text-center">
              <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                Solicitações
              </h2>
              <p className="text-md text-muted-foreground">
                Gerencie solicitações de alterações de dados.
              </p>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-transparent">
              {userTipoPerfil && userTipoPerfil in SolicitacoesMap
                ? SolicitacoesMap[
                    userTipoPerfil as keyof typeof SolicitacoesMap
                  ]
                : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
