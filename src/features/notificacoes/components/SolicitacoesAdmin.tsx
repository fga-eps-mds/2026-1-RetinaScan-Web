import { Inbox
  , Loader2 } from 'lucide-react';
import { useGetSolicitacoes } from '../hooks/useGetSolicitacoes';
import SolicitacaoCardAdmin from './SolicitacaoCardAdmin';
import { Card, CardContent } from '@/components/ui/card';

const SolicitacoesAdmin = () => {
  const {
    data: solicitacoes = [],
    isPending,
    isError,
    error,
    refetch,
  } = useGetSolicitacoes();

  if (isPending) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando solicitações...
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-destructive">
            Erro ao carregar solicitações.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error)?.message || 'Tente novamente em instantes.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-4 rounded-full bg-background p-3 shadow-sm">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="text-base font-semibold text-foreground">
            Nenhuma solicitação encontrada
          </h3>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Não há solicitações de alteração de dados no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {solicitacoes.map((solicitacao) => (
        <SolicitacaoCardAdmin
          key={solicitacao.id}
          solicitacao={solicitacao}
          refetch={refetch}
        />
      ))}
    </div>
  );
};

export default SolicitacoesAdmin;
