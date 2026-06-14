import { useState } from 'react';
import { Check, CircleX, Loader2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter as AlertFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getStatusBadge } from './GetStatusBadge';

/**
 * Layout reutilizável para cards de aprovação/rejeição.
 * Centraliza a lógica de confirmação (AlertDialog) e estados de carregamento.
 */
type ActionCardLayoutProps = {
  id: string;
  title: string;
  icon: LucideIcon;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'| 'CONVITE_ENVIADO' | 'EXPIRADA';
  isPendingStatus: boolean;
  motivoRejeicaoSalvo?: string | null;
  
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: () => void;
  onReject: (motivo: string) => void;

  labels: {
    rejectTitle: string;
    rejectDesc: string;
    acceptTitle: string;
    acceptDesc: string;
  };
  
  children: React.ReactNode;
};

export const ActionCardLayout = ({
  id, title, icon: Icon, status, isPendingStatus, motivoRejeicaoSalvo,
  isAccepting, isRejecting, onAccept, onReject, labels, children,
}: ActionCardLayoutProps) => {
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  
  // Bloqueia o botão de recusar se não houver texto
  const canReject = motivoRejeicao.trim().length > 0;

  const handleRejectClick = () => {
    onReject(motivoRejeicao);
    setMotivoRejeicao('');
  };

  return (
    <Card className="border-border/60 shadow-sm transition-colors hover:bg-muted/20">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="break-all">ID da solicitação: {id}</CardDescription>
        </div>
        <div>{getStatusBadge(status as 'PENDENTE' | 'APROVADA' | 'REJEITADA')}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        {children}

        {/* Exibe feedback de rejeições anteriores, se houver */}
        {motivoRejeicaoSalvo && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-destructive">Motivo da rejeição</p>
            <p className="mt-1 text-sm text-destructive/90">{motivoRejeicaoSalvo}</p>
          </div>
        )}

        {/* Campo de input condicional: visível apenas enquanto a inscrição está pendente */}
        {isPendingStatus && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-background p-4">
            <Label htmlFor={`motivo-${id}`}>Motivo da rejeição</Label>
            <Input
              id={`motivo-${id}`}
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              placeholder="Informe o motivo para recusar"
            />
          </div>
        )}
      </CardContent>

      {/* Footer condicional: botões de ação só aparecem em status pendente */}
      {isPendingStatus && (
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto" disabled={isAccepting || isRejecting || !canReject}>
                {isRejecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recusando...</> : <><CircleX className="mr-2 h-4 w-4" /> Recusar</>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{labels.rejectTitle}</AlertDialogTitle>
                <AlertDialogDescription>{labels.rejectDesc}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRejectClick}>Confirmar recusa</AlertDialogAction>
              </AlertFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full sm:w-auto" disabled={isAccepting || isRejecting}>
                {isAccepting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aceitando...</> : <><Check className="mr-2 h-4 w-4" /> Aceitar</>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{labels.acceptTitle}</AlertDialogTitle>
                <AlertDialogDescription>{labels.acceptDesc}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onAccept}>Confirmar aprovação</AlertDialogAction>
              </AlertFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
};