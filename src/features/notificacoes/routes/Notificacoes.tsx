import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SolicitacoesMedico from '../components/SolicitacoesMedico';
import SolicitacoesAdmin from '../components/SolicitacoesAdmin';
import CadastrosAdmin from '../components/CadastrosAdmin';
import { useSession } from '@/lib/auth-client';
import type { NotificationStatusFilter } from '../api/listMyNotifications';
import { useListNotifications } from '../hooks/useListNotifications';
import { NotificationCard } from '../components/NotificationCard';
import { NotificationCardSkeleton } from '../components/NotificationCardSkeleton';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useDeleteNotification } from '../hooks/useDeleteNotification';
import type { GetSolicitacoesParams } from '../hooks/useGetSolicitacoes';

type LocalFilter = 'todas' | 'nao-lidas' | 'novas';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const userTipoPerfil = session?.user?.tipoPerfil;

  const [tabFiltro, setTabFiltro] = useState<LocalFilter>('todas');

  
  const apiStatusFilter: NotificationStatusFilter =
    tabFiltro === 'nao-lidas' ? 'nao-lidas' : 'todas';

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('TODAS');
  const [ordenacao, setOrdenacao] = useState<string>('createdAt-desc');

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

  // --- MEMO PARA MONTAR OS PARÂMETROS DO ADMIN ---
  const adminFilters = useMemo<GetSolicitacoesParams>(() => {
    const params: GetSolicitacoesParams = {};

    // Tratamento do Status
    if (statusFiltro !== 'TODAS') {
      params.status = statusFiltro as GetSolicitacoesParams['status'];
    }

    // Tratamento inteligente da busca livre
    if (busca.trim()) {
      const termo = busca.trim();
      if (termo.includes('@') || termo.endsWith('.com')) {
        params.email = termo;
      } else {
        params.nome = termo;
      }
    }

    // Tratamento de Ordenação (Separa a string "campo-ordem")
    const [sortBy, sortOrder] = ordenacao.split('-');
    params.sortBy = sortBy as GetSolicitacoesParams['sortBy'];
    params.sortOrder = sortOrder as GetSolicitacoesParams['sortOrder'];

    return params;
  }, [busca, statusFiltro, ordenacao]);

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

    const clearAllFilters = () => {
    setBusca('');
    setOrdenacao('');
    setStatusFiltro('TODAS');
  };

  const hasFilters =
    !!busca.trim() || !!ordenacao || !!statusFiltro;


  return (
    <div className="flex h-full flex-col overflow-hidden px-6 py-8 sm:px-10 lg:px-12">
      <Tabs defaultValue="alertas" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-fit shrink-0">
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>

          {userTipoPerfil === 'ADMIN' && (
            <TabsTrigger value="cadastros">Inscrições</TabsTrigger>
          )}
        </TabsList>

        {/* TAB: NOTIFICACOES */}
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

        {/* TAB: SOLICITAÇÕES */}
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

            {/* SEÇÃO DE FILTROS EXCLUSIVA DO ADMIN */}
            {userTipoPerfil === 'ADMIN' && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-white p-4 md:flex-row md:items-center md:justify-between shrink-0">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-9 md:w-80 border-slate-200 h-12 pr-10"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Select de Status */}
                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger className="h-12 w-full sm:w-44 border-slate-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODAS">Todos os Status</SelectItem>
                      <SelectItem value="PENDENTE">Pendentes</SelectItem>
                      <SelectItem value="ACEITO">Aceitas</SelectItem>
                      <SelectItem value="REJEITADO">Recusadas</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Select de Ordenação */}
                  <Select value={ordenacao} onValueChange={setOrdenacao}>
                    <SelectTrigger className="h-12 w-full sm:w-56 border-slate-200">
                      <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">
                        Mais recentes primeiro
                      </SelectItem>
                      <SelectItem value="createdAt-asc">
                        Mais antigas primeiro
                      </SelectItem>
                      <SelectItem value="nomeCompleto-asc">
                        Nome (A-Z)
                      </SelectItem>
                      <SelectItem value="nomeCompleto-desc">
                        Nome (Z-A)
                      </SelectItem>
                      <SelectItem value="status-asc">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearAllFilters}
                  disabled={!hasFilters}
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-transparent">
              {userTipoPerfil === 'ADMIN' ? (
                // Passamos o objeto montado dinamicamente para o componente Admin
                <SolicitacoesAdmin filters={adminFilters} />
              ) : (
                <SolicitacoesMedico />
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB: INSCRICOES */}
        {userTipoPerfil === 'ADMIN' && (
          <TabsContent
            value="cadastros"
            className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
              <header className="shrink-0 text-center">
                <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                  Novas Inscrições
                </h2>
                <p className="text-md text-muted-foreground">
                  Avalie as informações de médicos convidados e aprove o acesso.
                </p>
              </header>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-transparent">
                <CadastrosAdmin />
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
