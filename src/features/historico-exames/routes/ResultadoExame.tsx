import { useEffect, useMemo, useRef, useState } from 'react';
import { CardDetalhes } from '../components/CardDetalhes';
import { CardResultado } from '../components/CardResultado';
import { CardImagens } from '../components/CardImagens';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon, LoaderCircle, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { useGetResultadoExame } from '../hooks/useGetResultadoExame';
import { CardComorbidades } from '../components/CardComorbidades';
import { CardLaudo, type LaudoValue } from '../components/CardLaudo';
import { CardLaudoVisualizacao } from '../components/CardLaudoVisualizacao';
import { authClient } from '@/lib/auth-client';
import { useExamLock } from '../hooks/useExamLock';
import { Badge } from '@/components/ui/badge';
import { useCreateSpecialistReport } from '../hooks/useCreateSpecialistReport';
import { toast } from 'sonner';
import { useUpdateSpecialistReport } from '../hooks/useUpdateSpecialistReport';

const REPORT_EDIT_WINDOW_DAYS = Number(
  import.meta.env.VITE_SPECIALIST_REPORT_EDIT_WINDOW_DAYS ?? 0
);

interface HeaderBadgesProps {
  readonly canEditReport: boolean;
  readonly isEditor: boolean;
  readonly isBlocked: boolean;
  readonly editorNome: string | null;
  readonly hasSpecialistReport: boolean;
}

function HeaderBadges({
  canEditReport,
  isEditor,
  isBlocked,
  editorNome,
  hasSpecialistReport,
}: HeaderBadgesProps) {
  if (canEditReport && isEditor) {
    return (
      <Badge variant="secondary" className="ml-2">
        Editando agora
      </Badge>
    );
  }
  if (canEditReport && isBlocked) {
    return (
      <Badge
        variant="outline"
        className="ml-2 border-amber-300 bg-amber-50 text-amber-700"
      >
        Em edição por {editorNome ?? 'outro especialista'}
      </Badge>
    );
  }
  if (hasSpecialistReport && !canEditReport) {
    return (
      <Badge
        variant="outline"
        className="ml-2 border-slate-300 bg-slate-50 text-slate-700"
      >
        Laudo disponível
      </Badge>
    );
  }
  return null;
}

interface ReportInfoBannersProps {
  readonly hasSpecialistReport: boolean;
  readonly specialistReportName: string | null;
  readonly canEditExistingReport: boolean;
  readonly editWindowLabel: string | null;
  readonly isEditWindowExpired: boolean;
}

function ReportInfoBanners({
  hasSpecialistReport,
  specialistReportName,
  canEditExistingReport,
  editWindowLabel,
  isEditWindowExpired,
}: ReportInfoBannersProps) {
  return (
    <>
      {hasSpecialistReport && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Laudo registrado por {specialistReportName ?? 'especialista'}.
        </div>
      )}

      {hasSpecialistReport && canEditExistingReport && editWindowLabel && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Você pode editar este laudo até {editWindowLabel}.
        </div>
      )}

      {isEditWindowExpired && (
        <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          O prazo para editar este laudo expirou.
        </div>
      )}
    </>
  );
}

interface LockStatusBannersProps {
  readonly isLockLoading: boolean;
  readonly isBlocked: boolean;
  readonly isEditor: boolean;
  readonly editorNome: string | null;
}

function LockStatusBanners({
  isLockLoading,
  isBlocked,
  isEditor,
  editorNome,
}: LockStatusBannersProps) {
  if (isLockLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>Verificando disponibilidade de edição...</span>
      </div>
    );
  }
  if (isBlocked) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Este laudo está sendo editado por {editorNome ?? 'outro especialista'}.
      </div>
    );
  }
  if (isEditor) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Você está com a edição ativa deste laudo.
      </div>
    );
  }
  return null;
}

const ResultadoExame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } =
    useGetResultadoExame(id);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const isEspecialista = session?.user?.tipoPerfil === 'ESPECIALISTA';
  const specialistReport = data?.exam.laudoEspecialista ?? null;
  const hasSpecialistReport = Boolean(specialistReport);

  const isReportOwner =
    specialistReport?.specialistId != null &&
    specialistReport.specialistId === session?.user?.id;

  // CORREÇÃO: Alinhando a dependência com o objeto especialista inferido pelo React Compiler
  const reportEditDeadline = useMemo(() => {
    const createdAtDate = specialistReport?.createdAt
      ? new Date(specialistReport.createdAt)
      : null;

    return createdAtDate
      ? new Date(
          createdAtDate.getTime() +
            REPORT_EDIT_WINDOW_DAYS * 24 * 60 * 60 * 1000
        )
      : null;
  }, [specialistReport]);

  const isWithinEditWindow =
    !hasSpecialistReport ||
    !reportEditDeadline ||
    new Date() <= reportEditDeadline;

  const canCreateReport = isEspecialista && !hasSpecialistReport;
  const canEditExistingReport =
    isEspecialista &&
    hasSpecialistReport &&
    isReportOwner &&
    isWithinEditWindow;
  const canEditReport = canCreateReport || canEditExistingReport;
  const isEditWindowExpired =
    hasSpecialistReport && isReportOwner && !isWithinEditWindow;

  const editWindowLabel = useMemo(() => {
    if (!hasSpecialistReport || !reportEditDeadline) return null;

    return reportEditDeadline.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }, [hasSpecialistReport, reportEditDeadline]);

  const [laudo, setLaudo] = useState<LaudoValue>({
    json: null,
    html: '',
    texto: '',
    resultadoIaValido: null,
  });

  // Guarda o id do último laudo sincronizado para não sobrescrever edições locais
  // em refetches que retornem o mesmo laudo.
  const syncedReportIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Ainda sem dados — aguarda.
    if (specialistReport === undefined) return;

    // Laudo já foi sincronizado com este id; não sobrescreve edições locais.
    if (syncedReportIdRef.current === (specialistReport?.id ?? null)) return;

    syncedReportIdRef.current = specialistReport?.id ?? null;

    if (!specialistReport) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLaudo({ json: null, html: '', texto: '', resultadoIaValido: null });
      return;
    }

    setLaudo({
      json: (() => {
        try {
          return typeof specialistReport.conteudo === 'string'
            ? JSON.parse(specialistReport.conteudo)
            : (specialistReport.conteudo ?? null);
        } catch {
          return null;
        }
      })(),
      html: specialistReport.html ?? '',
      texto: specialistReport.texto ?? '',
      resultadoIaValido: specialistReport.resultadoIaValido ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialistReport?.id]);

  const { lockState } = useExamLock({
    examId: id,
    enabled: !isSessionPending && Boolean(id && canEditReport),
  });

  const isLockLoading = lockState.status === 'loading';
  const isEditor = lockState.status === 'editor';
  const isBlocked = lockState.status === 'blocked';
  const editorNome =
    lockState.status === 'blocked' ? lockState.editorNome : null;

  const { mutateAsync: createReport, isPending: isCreatingReport } =
    useCreateSpecialistReport();
  const { mutateAsync: updateReport, isPending: isUpdatingReport } =
    useUpdateSpecialistReport();

  const isSavingReport = isCreatingReport || isUpdatingReport;
  const shouldShowEditableCard = canEditReport;
  const shouldShowReadonlyCard = hasSpecialistReport && !canEditReport;
  const isCardDisabled = isBlocked || isLockLoading || isSavingReport;

  const cardPlaceholder = useMemo(() => {
    if (isLockLoading) return 'Verificando disponibilidade...';
    if (isBlocked)
      return `Aguardando ${editorNome ?? 'outro especialista'} finalizar a edição`;
    return hasSpecialistReport
      ? 'Edite o laudo do especialista...'
      : 'Digite o laudo do especialista...';
  }, [isLockLoading, isBlocked, editorNome, hasSpecialistReport]);

  const handleSubmitLaudo = async (value: LaudoValue) => {
    if (!id || value.resultadoIaValido === null || !canEditReport) return;

    const payload = {
      examId: id,
      texto: value.texto.trim(),
      html: value.html,
      json: value.json ?? {},
      resultadoIaValido: value.resultadoIaValido,
    };

    if (hasSpecialistReport) {
      await updateReport(payload);
      toast.success('Laudo atualizado com sucesso!');
      return;
    }

    await createReport(payload);
    await refetch();
    toast.success('Laudo criado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full overflow-y-auto p-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <p>Carregando resultado do exame...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-screen w-full overflow-y-auto p-8">
        <p className="text-sm text-destructive">
          Não foi possível carregar o resultado do exame.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-auto p-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-border pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="text-left">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/exames')}
              className="inline-flex cursor-pointer items-center text-foreground transition-colors hover:text-primary"
              aria-label="Voltar para exames"
            >
              <ArrowLeft className="mr-2 inline-block h-5 w-5 align-middle" />
            </button>

            <h2 className="text-4xl font-heading font-bold text-foreground sm:text-lg">
              Exame {data.exam.id}
            </h2>

            <HeaderBadges
              canEditReport={canEditReport}
              isEditor={isEditor}
              isBlocked={isBlocked}
              editorNome={editorNome}
              hasSpecialistReport={hasSpecialistReport}
            />
          </div>

          <p className="text-md text-muted-foreground">
            Detalhes e resultado do exame
          </p>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Button type="button" className="gap-2 p-4 font-semibold">
            <DownloadIcon className="h-4 w-4" />
            Baixar Laudo
          </Button>

          <Button
            type="button"
            variant="outline"
            className="gap-2 p-4 font-semibold"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </header>

      {isFetching && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>Atualizando dados do exame...</span>
        </div>
      )}

      <div className="space-y-3 pb-6">
        <CardImagens imagens={data.imagens} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="lg:col-span-2">
            <CardResultado payload={data} />
          </div>

          <div className="h-full">
            <CardDetalhes exame={data.exam} />
          </div>

          <div className="h-full">
            <CardComorbidades comorbidades={data.exam.comorbidades} />
          </div>

          {(isEspecialista || hasSpecialistReport) &&
            data.exam.status === 'CONCLUIDO' && (
              <div className="lg:col-span-2 space-y-4">
                <ReportInfoBanners
                  hasSpecialistReport={hasSpecialistReport}
                  specialistReportName={
                    specialistReport?.specialist?.nomeCompleto ?? null
                  }
                  canEditExistingReport={canEditExistingReport}
                  editWindowLabel={editWindowLabel}
                  isEditWindowExpired={isEditWindowExpired}
                />

                {shouldShowEditableCard && (
                  <>
                    <LockStatusBanners
                      isLockLoading={isLockLoading}
                      isBlocked={isBlocked}
                      isEditor={isEditor}
                      editorNome={editorNome}
                    />

                    <CardLaudo
                      key={specialistReport?.id ?? 'novo-laudo'}
                      mode={hasSpecialistReport ? 'edit' : 'create'}
                      value={laudo}
                      onChange={setLaudo}
                      onSubmit={handleSubmitLaudo}
                      disabled={isCardDisabled}
                      placeholder={cardPlaceholder}
                    />
                  </>
                )}

                {shouldShowReadonlyCard && (
                  <CardLaudoVisualizacao
                    especialistaNome={
                      specialistReport?.specialist?.nomeCompleto
                    }
                    resultadoIaValido={
                      specialistReport?.resultadoIaValido ?? null
                    }
                    html={specialistReport?.html}
                    texto={specialistReport?.texto}
                    conteudo={specialistReport?.conteudo}
                  />
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResultadoExame;
