/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Calendar,
  IdCard,
  Mail,
  Stethoscope,
  UserPlus,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import type { InscricaoPendente } from '../api/getInscricoesPendentes';
import { useAvaliarInscricao } from '../hooks/useAvaliarInscricao';
import { ActionCardLayout } from './ActionCardLayout';
import { formatCpf, formatCrm } from '@/utils/formatters';

type InscricaoCardAdminProps = {
  inscricao: InscricaoPendente;
};

const formatDateSafe = (value: string | null) => {
  if (!value) return 'Não informado';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Não informado';
  }

  return date.toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });
};

const formatCpfSafe = (value: string | null) => {
  if (!value) return 'Não informado';
  return formatCpf(value);
};

const formatCrmSafe = (value: string | null) => {
  if (!value) return 'Não informado';
  return formatCrm(value);
};

export const InscricaoCardAdmin = ({ inscricao }: InscricaoCardAdminProps) => {
  const avaliarMutation = useAvaliarInscricao();

  const handleAccept = async () => {
    try {
      await avaliarMutation.mutateAsync({
        id: String(inscricao.id),
        payload: { decisao: 'APROVADA' },
      });
      toast.success('Inscrição aprovada com sucesso.');
    } catch (error: any) {
      toast.error('Erro ao aprovar inscrição.', {
        description: error?.response?.data?.mensagem || 'Tente novamente.',
      });
    }
  };

  const handleReject = async (motivo: string) => {
    try {
      await avaliarMutation.mutateAsync({
        id: String(inscricao.id),
        payload: { decisao: 'REJEITADA', motivoRejeicao: motivo },
      });
      toast.success('Inscrição recusada com sucesso.');
    } catch (error: any) {
      toast.error('Erro ao recusar inscrição.', {
        description: error?.response?.data?.mensagem || 'Tente novamente.',
      });
    }
  };

  return (
    <ActionCardLayout
      id={inscricao.id}
      title="Nova solicitação de cadastro"
      icon={UserPlus}
      status={inscricao.status}
      isPendingStatus={inscricao.status === 'PENDENTE'}
      isAccepting={
        avaliarMutation.isPending &&
        avaliarMutation.variables?.id === String(inscricao.id) &&
        avaliarMutation.variables?.payload?.decisao === 'APROVADA'
      }
      isRejecting={
        avaliarMutation.isPending &&
        avaliarMutation.variables?.id === String(inscricao.id) &&
        avaliarMutation.variables?.payload?.decisao === 'REJEITADA'
      }
      onAccept={handleAccept}
      onReject={handleReject}
      labels={{
        rejectTitle: 'Recusar cadastro?',
        rejectDesc:
          'Essa ação marcará a solicitação como rejeitada. O médico não receberá acesso.',
        acceptTitle: 'Aprovar cadastro?',
        acceptDesc:
          'Ao aprovar, o usuário será criado efetivamente no sistema.',
      }}
    >
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Dados pessoais
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
              <UserRound className="inline h-3.5 w-3.5" /> Nome
            </p>
            <p className="text-sm font-medium">
              {inscricao.nomeCompleto ?? 'Não informado'}
            </p>
          </div>

          <div className="rounded-lg border bg-background/80 p-3">
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
              <Mail className="inline h-3.5 w-3.5" /> Email
            </p>
            <p className="text-sm font-medium">
              {inscricao.email ?? 'Não informado'}
            </p>
          </div>

          <div className="rounded-lg border bg-background/80 p-3">
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
              <Calendar className="inline h-3.5 w-3.5" /> Nascimento
            </p>
            <p className="text-sm font-medium">
              {formatDateSafe(inscricao.dtNascimento)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            <IdCard className="mb-1 inline h-4 w-4" /> CPF
          </p>
          <p className="text-sm font-medium">{formatCpfSafe(inscricao.cpf)}</p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            <Stethoscope className="mb-1 inline h-4 w-4" /> CRM
          </p>
          <p className="text-sm font-medium">{formatCrmSafe(inscricao.crm)}</p>
        </div>
      </div>

      {inscricao.status === 'CONVITE_ENVIADO' && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          <Mail className="h-4 w-4 shrink-0" />
          <p>
            Este médico foi convidado, mas ainda não completou o preenchimento
            dos dados.
          </p>
        </div>
      )}
    </ActionCardLayout>
  );
};
