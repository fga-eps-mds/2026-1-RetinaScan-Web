import { FileText, Hash, Mail, UserRound } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getStatusBadge } from './GetStatusBadge';
import type { Solicitacao } from '../types/Solicitacao';

const SolicitacaoCard = ({ solicitacao }: { solicitacao: Solicitacao }) => {
  return (
    <Card className="border-border/60 shadow-sm transition-colors hover:bg-muted/20">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Solicitação de alteração cadastral
          </CardTitle>
          <CardDescription>{solicitacao.id}</CardDescription>
        </div>
        {getStatusBadge(solicitacao.status)}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Layout espelhando o Admin */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Dados do solicitante</p>
              <p className="text-xs text-muted-foreground">Informações do usuário que pediu a alteração</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Hash className="h-3.5 w-3.5" /> ID do usuário
              </p>
              <span className="font-medium text-foreground">{solicitacao.idUsuario}</span>
            </div>
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <UserRound className="h-3.5 w-3.5" /> Nome
              </p>
              <span className="font-medium text-foreground">{solicitacao.nomeCompleto}</span>
            </div>
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Email
              </p>
              <span className="font-medium text-foreground">{solicitacao.email}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Novo CPF</p>
            <p className="mt-1 text-sm font-medium text-foreground">{solicitacao.cpfNovo || 'Não informado'}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Novo CRM</p>
            <p className="mt-1 text-sm font-medium text-foreground">{solicitacao.crmNovo || 'Não informado'}</p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <p><span className="font-medium text-foreground">Criado em:</span> {new Date(solicitacao.createdAt).toLocaleString('pt-BR')}</p>
          <p><span className="font-medium text-foreground">Atualizado em:</span> {new Date(solicitacao.updatedAt).toLocaleString('pt-BR')}</p>
        </div>

        {solicitacao.motivoRejeicao && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-destructive">Motivo da rejeição</p>
            <p className="mt-1 text-sm text-destructive/90">{solicitacao.motivoRejeicao}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SolicitacaoCard;