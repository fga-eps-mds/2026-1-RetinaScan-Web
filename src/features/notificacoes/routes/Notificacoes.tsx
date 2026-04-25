import { NotificationsList } from "../components/NotificacoesLista"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsPage() {
  return (
   <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="text-center">
          <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
            Notificações
          </h2>
          <p className="text-md text-muted-foreground">

            Acompanhe alertas clínicos, atualizações da fila e eventos do sistema.
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

        <Button variant="outline">
          Marcar todas como lidas
        </Button>
      </div>

      <NotificationsList />
    </div>
    </div>
  )
}