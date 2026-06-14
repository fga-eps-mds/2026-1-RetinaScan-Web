import { Inbox, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGetInscricoesPendentes } from '../hooks/useGetInscricoesPendentes';
import { InscricaoCardAdmin } from './InscricaoCardAdmin';

const CadastrosAdmin = () => {
  // O hook gerencia o cache e o estado da requisição via react-query
  const {
    data: inscricoes = [],
    isPending,
    isError,
    error,
  } = useGetInscricoesPendentes();

  // Estado de carregamento inicial
  if (isPending) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando cadastros pendentes...
      </div>
    );
  }

  // Tratamento de falhas na requisição (ex: rede ou erro de servidor)
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-destructive">
            Erro ao carregar novos cadastros.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error)?.message || 'Tente novamente em instantes.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Estado de lista vazia (UX: feedback visual de ausência de dados)
  if (inscricoes.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-4 rounded-full bg-background p-3 shadow-sm">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="text-base font-semibold text-foreground">
            Nenhuma inscrição pendente
          </h3>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Não há novas inscrições aguardando aprovação no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Renderização principal: lista de cards
  return (
    <div className="flex flex-col gap-4">
      {inscricoes.map((inscricao) => (
        <InscricaoCardAdmin
          key={inscricao.id} // Chave única vital para a re-renderização eficiente do React
          inscricao={inscricao}
        />
      ))}
    </div>
  );
};

export default CadastrosAdmin;