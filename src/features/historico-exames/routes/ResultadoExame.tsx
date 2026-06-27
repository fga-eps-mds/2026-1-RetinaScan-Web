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
import { ModalCompartilhar } from '../components/ModalCompartilhar';
import { useDownloadLaudo } from '../hooks/useDownloadLaudo';


// Define a janela de tempo (em dias) que um laudo pode ser editado após a criação.
const REPORT_EDIT_WINDOW_DAYS = Number(
  import.meta.env.VITE_SPECIALIST_REPORT_EDIT_WINDOW_DAYS ?? 0
);

// ============================================================================
// COMPONENTES DE APRESENTAÇÃO (Helpers)
// Isolam a lógica visual dos banners e badges para não poluir o render principal.
// ============================================================================

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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ResultadoExame = () => {
  // Hooks de roteamento
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Hooks de funcionalidades
  const { handleDownload, isDownloading } = useDownloadLaudo();
  
  // Queries de dados da API e Sessão
  const { data, isLoading, isError, error, isFetching, refetch } = 
    useGetResultadoExame(id);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  
  // --------------------------------------------------------------------------
  // DERIVAÇÃO DE ESTADOS E PERMISSÕES
  // --------------------------------------------------------------------------
  const isEspecialista = session?.user?.tipoPerfil === 'ESPECIALISTA';
  const specialistReport = data?.exam.laudoEspecialista ?? null;
  const hasSpecialistReport = Boolean(specialistReport);

  const isReportOwner =
    specialistReport?.specialistId != null &&
    specialistReport.specialistId === session?.user?.id;
  // Calcula o prazo máximo para edição somando os dias permitidos à data de criação
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

  // Regras de negócio de edição do laudo
  const canCreateReport = isEspecialista && !hasSpecialistReport;
  const canEditExistingReport =
    isEspecialista &&
    hasSpecialistReport &&
    isReportOwner &&
    isWithinEditWindow;
  const canEditReport = canCreateReport || canEditExistingReport;
  const isEditWindowExpired =
    hasSpecialistReport && isReportOwner && !isWithinEditWindow;

  // Formatação amigável do prazo para exibição na UI
  const editWindowLabel = useMemo(() => {
    if (!hasSpecialistReport || !reportEditDeadline) return null;

    return reportEditDeadline.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }, [hasSpecialistReport, reportEditDeadline]);

  // --------------------------------------------------------------------------
  // GERENCIAMENTO DE ESTADO DO EDITOR
  // --------------------------------------------------------------------------
  const [laudo, setLaudo] = useState<LaudoValue>({
    json: null,
    html: '',
    texto: '',
    resultadoIaValido: null,
  });

  // Guarda o id do último laudo sincronizado para não sobrescrever edições locais
  // em refetches que retornem o mesmo laudo. Evita loop e perda de dados do usuário.
  const syncedReportIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Ainda sem dados — aguarda.
    if (specialistReport === undefined) return;

    // Laudo já foi sincronizado com este id; não sobrescreve edições locais.
    if (syncedReportIdRef.current === (specialistReport?.id ?? null)) return;

    syncedReportIdRef.current = specialistReport?.id ?? null;

    // Reseta o formulário se não houver laudo
    if (!specialistReport) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLaudo({ json: null, html: '', texto: '', resultadoIaValido: null });
      return;
    }

    // Popula o estado com os dados recebidos do backend
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

  // --------------------------------------------------------------------------
  // GERENCIAMENTO DE CONCORRÊNCIA (LOCKS) E MUTAÇÕES
  // --------------------------------------------------------------------------
  
  // Hook responsável por impedir que dois especialistas editem o mesmo exame simultaneamente
  const { lockState } = useExamLock({
    examId: id,
    enabled: !isSessionPending && Boolean(id && canEditReport),
  });

  const isLockLoading = lockState.status === 'loading';
  const isEditor = lockState.status === 'editor';
  const isBlocked = lockState.status === 'blocked';
  const editorNome =
    lockState.status === 'blocked' ? lockState.editorNome : null;

  // Mutations da API
  const { mutateAsync: createReport, isPending: isCreatingReport } = useCreateSpecialistReport();
  const { mutateAsync: updateReport, isPending: isUpdatingReport } = useUpdateSpecialistReport();

  // Variáveis derivadas para controle de UI
  const isSavingReport = isCreatingReport || isUpdatingReport;
  const shouldShowEditableCard = canEditReport;
  const shouldShowReadonlyCard = hasSpecialistReport && !canEditReport;
  const isCardDisabled = isBlocked || isLockLoading || isSavingReport;

  // Mensagem dinâmica para o input do editor baseada no estado atual
  const cardPlaceholder = useMemo(() => {
    if (isLockLoading) return 'Verificando disponibilidade...';
    if (isBlocked)
      return `Aguardando ${editorNome ?? 'outro especialista'} finalizar a edição`;
    return hasSpecialistReport
      ? 'Edite o laudo do especialista...'
      : 'Digite o laudo do especialista...';
  }, [isLockLoading, isBlocked, editorNome, hasSpecialistReport]);

  // Handler de submissão do editor
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

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DA PÁGINA
  // --------------------------------------------------------------------------

  // Tela de Loading inicial
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

  // Tratamento de falha na requisição
  if (isError || !data) {
    // Verifica se a API retornou erro de acesso negado (403 ou 401)
    const err = error as { response?: { status?: number } } | null;
    const isAcessoNegado = err?.response?.status === 403 || err?.response?.status === 401;
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4 rounded-xl border border-border bg-muted/30 p-8 shadow-sm">
          {isAcessoNegado ? (
            <>
              <h2 className="text-xl font-bold text-destructive">Acesso Indisponível</h2>
              <p className="text-sm text-muted-foreground">
                Você não possui permissão para visualizar este exame. O link pode ter expirado ou o acesso foi revogado pelo médico.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-destructive">Erro ao carregar</h2>
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar o resultado do exame no momento.
              </p>
            </>
          )}
          <Button type="button" className="mt-4" onClick={() => navigate('/exames')}>
            Voltar para meus exames
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-auto p-8">
      {/* Cabeçalho e Ações Principais */}
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
          <Button
            type="button"
            className="gap-2 p-4 font-semibold min-w-40"
            disabled={isDownloading}
            onClick={() => {
              if (id) handleDownload(id, `relatorio-exame-${id}.pdf`);
            }}
          >
            {isDownloading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Baixando...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4" />
                Baixar Relatório
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 p-4 font-semibold"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </header>

      {/* Indicador de revalidação de dados em background (Refetching) */}
      {isFetching && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>Atualizando dados do exame...</span>
        </div>
      )}

      {/* Grid de Conteúdo Principal */}
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

          {/* Seção de Laudo: Exibida apenas para Especialistas ou se já houver laudo */}
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
      {id && (
        <ModalCompartilhar
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          examId={id}
        />
      )}
    </div>
  );
};
export default ResultadoExame;