import { NotificationsList } from '../components/NotificacoesLista';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SolicitacoesMedico from '../components/SolicitacoesMedico';
import SolicitacoesAdmin from '../components/SolicitacoesAdmin';
import { useSession } from '@/lib/auth-client';

const SolicitacoesMap = {
  ADMIN: <SolicitacoesAdmin />,
  MEDICO: <SolicitacoesMedico />,
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const userTipoPerfil = session?.user?.tipoPerfil;

  return (
    <div className="h-full flex flex-col px-6 py-8 sm:px-10 lg:px-12 overflow-hidden">
      <Tabs defaultValue="alertas" className="flex flex-col flex-1 min-h-0">
        <TabsList className="shrink-0 w-fit">
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
        </TabsList>

        <TabsContent
          value="alertas"
          className="flex-1 flex flex-col min-h-0 mt-6 overflow-hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col h-full gap-6">
            <header className="text-center shrink-0">
              <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                Notificações
              </h2>
              <p className="text-md text-muted-foreground">
                Acompanhe alertas clínicos, atualizações da fila e eventos do
                sistema.
              </p>
            </header>

            <div className="flex items-center justify-between border-t border-border/60 px-3 py-4 shrink-0">
              <Tabs defaultValue="todas">
                <TabsList>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="nao-lidas">Não lidas</TabsTrigger>
                  <TabsTrigger value="novas">Novas</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline">Marcar todas como lidas</Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-transparent pr-2">
              <NotificationsList />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="solicitacoes"
          className="flex-1 flex flex-col min-h-0 mt-6 overflow-hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col h-full gap-6">
            <header className="text-center shrink-0">
              <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                Solicitações
              </h2>
              <p className="text-md text-muted-foreground">
                Gerencie solicitações de alterações de dados.
              </p>
            </header>

            <div className="flex-1 overflow-y-auto scrollbar-transparent pr-2">
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
