/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Check,
  CircleX,
  FileText,
  Hash,
  Loader2,
  Mail,
  UserRound,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Solicitacao } from '../types/Solicitacao';
import { getStatusBadge } from './GetStatusBadge';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useDeleteSolicitacao } from '../hooks/useDeleteSolicitacao';
import { useAceitarSolicitacaoCrm } from '../hooks/useAceitarSolicitacaoCrm';
import { useRejeitarSolicitacaoCrm } from '../hooks/useRejeitarSolicitacaoCrm';

type SolicitacaoCardAdminProps = {
  solicitacao: Solicitacao;
  refetch: () => void;
};

const SolicitacaoCardAdmin = ({
  solicitacao,
  refetch,
}: SolicitacaoCardAdminProps) => {
  const aceitarMutation = useAceitarSolicitacaoCrm();
  const rejeitarMutation = useRejeitarSolicitacaoCrm();
  const deleteMutation = useDeleteSolicitacao();

  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  const isPendente = solicitacao.status === 'PENDENTE';

  const isAccepting =
    aceitarMutation.isPending &&
    String(aceitarMutation.variables) === String(solicitacao.id);

  const isRejecting =
    rejeitarMutation.isPending &&
    String(rejeitarMutation.variables?.id) === String(solicitacao.id);

  const isDeleting =
    deleteMutation.isPending &&
    String(deleteMutation.variables) == String(solicitacao.id);

  const canReject = motivoRejeicao.trim().length > 0;

  const handleAccept = async () => {
    try {
      await aceitarMutation.mutateAsync(String(solicitacao.id));
      await refetch();
      toast.success('Solicitação aceita com sucesso.');
    } catch (error: any) {
      toast.error('Erro ao aceitar solicitação.', {
        description:
          error?.response?.data?.mensagem ||
          error?.response?.data?.message ||
          error?.message ||
          'Tente novamente em instantes.',
      });
    }
  };

  const handleReject = async () => {
    if (!canReject) {
      toast.error('Informe o motivo da recusa.');
      return;
    }

    try {
      await rejeitarMutation.mutateAsync({
        id: String(solicitacao.id),
        motivoRejeicao: motivoRejeicao.trim(),
      });
      await refetch();
      toast.success('Solicitação recusada com sucesso.');
      setMotivoRejeicao('');
    } catch (error: any) {
      toast.error('Erro ao recusar solicitação.', {
        description:
          error?.response?.data?.mensagem ||
          error?.response?.data?.message ||
          error?.message ||
          'Tente novamente em instantes.',
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(String(solicitacao.id), {
      onSuccess: () => {
        toast.success('Solicitação excluída com sucesso!');
        // O cache será invalidado automaticamente pelo hook, mas chamamos o refetch por garantia
        refetch();
      },
      onError: (err: any) => {
        toast.error(err?.message || 'Erro ao excluir solicitação.');
      },
    });
  };

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

        <div className="flex items-center gap-3">
          {getStatusBadge(solicitacao.status)}

          {/* AlertDialog para Confirmação de Exclusão */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting || isAccepting || isRejecting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                  Excluir solicitação permanentemente?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A solicitação do usuário
                  correspondente ao ID{' '}
                  <span className="font-mono font-bold text-foreground">
                    {solicitacao.id}
                  </span>{' '}
                  será completamente removida do banco de dados e as auditorias
                  serão registradas.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Confirmar exclusão
                </AlertDialogAction>
              </AlertFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Dados do solicitante
              </p>
              <p className="text-xs text-muted-foreground">
                Informações do usuário que pediu a alteração
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-background/80 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                ID do usuário
              </p>
              <span className="font-medium text-foreground">
                {solicitacao.idUsuario || 'ID não carregado'}
              </span>
            </div>

            <div className="rounded-lg border bg-background/80 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <UserRound className="h-3.5 w-3.5" />
                Nome
              </p>
              <span className="font-medium text-foreground">
                {solicitacao.nomeCompleto || 'Nome não carregado'}
              </span>
            </div>

            <div className="rounded-lg border bg-background/80 p-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email
              </p>
                <span>{solicitacao.email || 'E-mail não carregado'}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Novo CPF
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {solicitacao.cpfNovo || 'Não informado'}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Novo CRM
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {solicitacao.crmNovo || 'Não informado'}
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            <span className="font-medium text-foreground">Criado em:</span>{' '}
            {new Date(solicitacao.createdAt).toLocaleString('pt-BR')}
          </p>

          <p>
            <span className="font-medium text-foreground">Atualizado em:</span>{' '}
            {new Date(solicitacao.updatedAt).toLocaleString('pt-BR')}
          </p>
        </div>

        {solicitacao.analisadoEm && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Analisado em:</span>{' '}
            {new Date(solicitacao.analisadoEm).toLocaleString('pt-BR')}
          </p>
        )}

        {solicitacao.motivoRejeicao && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-destructive">
              Motivo da rejeição
            </p>
            <p className="mt-1 text-sm text-destructive/90">
              {solicitacao.motivoRejeicao}
            </p>
          </div>
        )}

        {isPendente && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-background p-4">
            <Label htmlFor={`motivo-${solicitacao.id}`}>
              Motivo da rejeição
            </Label>
            <Input
              id={`motivo-${solicitacao.id}`}
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              placeholder="Informe o motivo para recusar a solicitação"
            />
          </div>
        )}
      </CardContent>

      {isPendente && (
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isAccepting || isRejecting || !canReject}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recusando...
                  </>
                ) : (
                  <>
                    <CircleX className="mr-2 h-4 w-4" />
                    Recusar
                  </>
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recusar solicitação?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação marcará a solicitação como rejeitada. Verifique se o
                  motivo informado está correto antes de continuar.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReject}>
                  Confirmar recusa
                </AlertDialogAction>
              </AlertFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full sm:w-auto"
                disabled={isAccepting || isRejecting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aceitando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Aceitar
                  </>
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Aceitar solicitação?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ao aceitar, os dados solicitados serão aprovados para esse
                  usuário.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAccept}>
                  Confirmar aceite
                </AlertDialogAction>
              </AlertFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
};

export default SolicitacaoCardAdmin;
