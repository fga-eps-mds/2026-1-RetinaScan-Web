import { useState } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  useGetInscricoesPendentes,
  type InscricaoStatusFilter,
} from '../hooks/useGetInscricoesPendentes';
import { InscricaoCardAdmin } from './InscricaoCardAdmin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusOptions: Array<{
  value: InscricaoStatusFilter;
  label: string;
}> = [
  { value: 'TODAS', label: 'Todos os status' },
  { value: 'CONVITE_ENVIADO', label: 'Convite enviado' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'APROVADA', label: 'Aprovada' },
  { value: 'REJEITADA', label: 'Rejeitada' },
  { value: 'EXPIRADA', label: 'Expirada' },
];

const CadastrosAdmin = () => {
  const [status, setStatus] = useState<InscricaoStatusFilter>('PENDENTE');

  const {
    data: inscricoes = [],
    isPending,
    isError,
    error,
  } = useGetInscricoesPendentes(status);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Cadastros</h2>
          <p className="text-sm text-muted-foreground">
            Filtre as inscrições pelo status atual.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label
            htmlFor="status-inscricao"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Status
          </label>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as InscricaoStatusFilter)}
          >
            <SelectTrigger id="status-inscricao" className="w-full">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>

            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isPending && (
          <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando inscrições...
          </div>
        )}

        {isError && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-destructive">
                Erro ao carregar inscrições.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {(error as Error)?.message || 'Tente novamente em instantes.'}
              </p>
            </CardContent>
          </Card>
        )}

        {!isPending && !isError && inscricoes.length === 0 && (
          <Card className="border-dashed border-border/80 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 rounded-full bg-background p-3 shadow-sm">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="text-base font-semibold text-foreground">
                Nenhuma inscrição encontrada
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Não há inscrições com o status selecionado no momento.
              </p>
            </CardContent>
          </Card>
        )}

        {!isPending && !isError && inscricoes.length > 0 && (
          <div className="flex flex-col gap-4">
            {inscricoes.map((inscricao) => (
              <InscricaoCardAdmin key={inscricao.id} inscricao={inscricao} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CadastrosAdmin;
