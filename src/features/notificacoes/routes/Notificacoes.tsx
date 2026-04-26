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

  console.log('Tipo de perfil do usuário:', userTipoPerfil);

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <Tabs defaultValue="alertas">
        <TabsList>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
        </TabsList>

        <TabsContent value="alertas">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <header className="text-center">
              <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                Notificações
              </h2>
              <p className="text-md text-muted-foreground">
                Acompanhe alertas clínicos, atualizações da fila e eventos do
                sistema.
              </p>
            </header>

            <div className="flex items-center justify-between border-t border-border/60 px-3 py-4">
              <Tabs defaultValue="todas">
                <TabsList>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="nao-lidas">Não lidas</TabsTrigger>
                  <TabsTrigger value="novas">Novas</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="outline">Marcar todas como lidas</Button>
            </div>

            <NotificationsList />
          </div>
        </TabsContent>

        <TabsContent value="solicitacoes">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <header className="text-center">
              <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                Solicitações
              </h2>
              <p className="text-md text-muted-foreground">
                Gerencie solicitações de alterações de dados.
              </p>
            </header>
            {userTipoPerfil && userTipoPerfil in SolicitacoesMap
              ? SolicitacoesMap[userTipoPerfil as keyof typeof SolicitacoesMap]
              : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
