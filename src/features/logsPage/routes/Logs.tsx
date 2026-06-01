import { LogsList } from '../components/LogsList';
import { Tabs, TabsContent} from '@/components/ui/tabs';



export default function LogsPage() {

  return (
    <div className="h-full flex flex-col px-6 py-8 sm:px-10 lg:px-12 overflow-hidden">
      <Tabs defaultValue="alertas" className="flex flex-col flex-1 min-h-0">

        <TabsContent
          value="alertas"
          className="flex-1 flex flex-col min-h-0 mt-6 overflow-hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col h-full gap-6">
            <header className="text-center shrink-0">
              <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
                Logs
              </h2>
              <p className="text-md text-muted-foreground">
                Registro de todas as movimentações do sistema.
              </p>
            </header>

            <div className="flex items-center justify-between border-t border-border/60 px-3 py-4 shrink-0">

            </div>

            <div className="flex-1 overflow-y-auto scrollbar-transparent pr-2">
              <LogsList />
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
