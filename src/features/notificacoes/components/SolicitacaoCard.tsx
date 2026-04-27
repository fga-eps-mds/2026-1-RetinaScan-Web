import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { getStatusBadge } from './GetStatusBadge';
import type { Solicitacao } from '../types/Solicitacao';

const SolicitacaoCard = ({ solicitacao }: { solicitacao: Solicitacao }) => {
  return (
    <Card
      key={solicitacao.id}
      className="border-border/60 shadow-sm transition-colors hover:bg-muted/30"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Solicitação de alteração
          </CardTitle>
          <CardDescription>ID: {solicitacao.id}</CardDescription>
        </div>

        {getStatusBadge(solicitacao.status)}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Novo CPF
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {solicitacao.cpfNovo || 'Não informado'}
            </p>
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Novo CRM
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {solicitacao.crmNovo || 'Não informado'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="font-medium text-foreground">Criado em:</span>{' '}
            {new Date(solicitacao.createdAt).toLocaleString('pt-BR')}
          </p>

          <p>
            <span className="font-medium text-foreground">Atualizado em:</span>{' '}
            {new Date(solicitacao.updatedAt).toLocaleString('pt-BR')}
          </p>
        </div>

        {solicitacao.motivoRejeicao && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
              Motivo da rejeição
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {solicitacao.motivoRejeicao}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SolicitacaoCard;
