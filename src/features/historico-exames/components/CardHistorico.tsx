import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusTag';
import { cn } from '@/lib/utils';
import {
  Search,
  AlertCircle,
  Inbox,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HistoricoSkeleton } from './HistoricoSkeleton';
import { useNavigate } from 'react-router';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetExams } from '../hooks/useGetExams';
import { useExamsPagination } from '../hooks/useGetTotalPages';
import { useDebouncedValue } from '../hooks/useDebounce';
import { formatDate } from '@/utils/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';
import { useExamEditingLocks } from '../hooks/useExamEditingLocks';

const EXAM_ID_REGEX = /^EX-\d{4}-\d{4}$/i;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isExactExamId(val: string) {
  return EXAM_ID_REGEX.test(val.trim());
}

function isExactUuid(val: string) {
  return UUID_REGEX.test(val.trim());
}

function isExactIdSearch(val: string) {
  const normalized = val.trim();
  return isExactExamId(normalized) || isExactUuid(normalized);
}

type ExamStatusFilter = 'all' | 'CRIADO' | 'CONCLUIDO' | 'EM_PROCESSAMENTO';

export function CardHistorico() {
  const navigate = useNavigate();
  const [filtroStatus, setFiltroStatus] = useState<ExamStatusFilter>('all');
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(1);

  const pageSize = 6;

  const { data: session } = authClient.useSession();
  const isEspecialista = session?.user?.tipoPerfil === 'ESPECIALISTA';

  const buscaDebounced = useDebouncedValue(busca, 400);

  const params = useMemo(() => {
    const valor = buscaDebounced.trim();
    const isId = isExactIdSearch(valor);

    return {
      page,
      pageSize,
      nomeCompleto: valor && !isId ? valor : '',
      id: valor && isId ? valor : '',
      status: filtroStatus === 'all' ? '' : filtroStatus,
    };
  }, [page, pageSize, buscaDebounced, filtroStatus]);

  const {
    data: exames = [],
    isLoading,
    isError,
    isFetching,
    isFetched,
    refetch: refetchExames,
  } = useGetExams(params);

  const examIds = useMemo(() => exames.map((e) => e.id), [exames]);

  const { data: editingLocks, refetch: refetchEditingLocks } =
    useExamEditingLocks(examIds, isEspecialista);

  const { data: pagination, isFetching: isFetchingPagination } =
    useExamsPagination(params);

  const hasData = exames.length > 0;
  const hasActiveFilters = Boolean(busca.trim() || filtroStatus !== 'all');
  const isTyping = busca !== buscaDebounced;

  const isFirstLoad = !isFetched && isLoading;
  const showSkeleton = isFirstLoad && !hasData;
  const showError = isError && !hasData;
  const showTypingHint = isTyping;
  const showBackgroundUpdating =
    !showSkeleton &&
    !showTypingHint &&
    !showError &&
    (isFetching || isFetchingPagination);
  const showEmpty =
    !showSkeleton &&
    !showError &&
    !showTypingHint &&
    !showBackgroundUpdating &&
    !hasData;

  const limparFiltros = () => {
    setFiltroStatus('all');
    setBusca('');
    setPage(1);
  };

  const handleRefresh = async () => {
    if (isEspecialista) {
      await Promise.all([refetchExames(), refetchEditingLocks()]);
      return;
    }
    await refetchExames();
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (pagination?.totalPages && page < pagination.totalPages) {
      setPage((p) => p + 1);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="mx-auto w-full max-w-6xl rounded-xl border-none bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <h2 className="w-full text-xl font-bold text-black md:w-auto">
            Histórico de Exames
          </h2>

          <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={handleRefresh}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    disabled={isFetching || isFetchingPagination || isTyping}
                    aria-label="Atualizar lista de exames"
                  >
                    <RefreshCcw
                      className={cn(
                        'h-4 w-4',
                        (isFetching || isFetchingPagination || isTyping) &&
                          'animate-spin'
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border bg-white text-muted-foreground">
                  Atualizar lista
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="w-full md:w-52">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mx-auto w-full">
                    <Select
                      value={filtroStatus}
                      onValueChange={(value) => {
                        setFiltroStatus(value as ExamStatusFilter);
                        setPage(1);
                      }}
                      disabled={showSkeleton}
                    >
                      <SelectTrigger className="flex h-10 w-full items-center justify-between rounded-xl border-slate-200 px-3 text-left focus:ring-1 focus:ring-blue-600">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        align="start"
                        className="w-full"
                      >
                        <SelectItem value="all">TODOS</SelectItem>
                        <SelectItem value="CRIADO">CRIADO</SelectItem>
                        <SelectItem value="CONCLUIDO">CONCLUÍDO</SelectItem>
                        <SelectItem value="EM_PROCESSAMENTO">
                          EM PROCESSAMENTO
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="border bg-white text-muted-foreground">
                  Filtre por status
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="relative w-full md:w-[320px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mx-auto w-full">
                    <Input
                      placeholder="Buscar exame..."
                      className={cn(
                        'h-12 rounded-xl border-slate-200 pr-10 transition-all focus-visible:ring-blue-600'
                      )}
                      value={busca}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setPage(1);
                      }}
                      disabled={showSkeleton}
                    />
                    <Search className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="border bg-white text-muted-foreground">
                  Busque por Nome, ID ou UUID
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {(showTypingHint || showBackgroundUpdating) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            {showTypingHint ? 'Buscando...' : 'Atualizando resultados...'}
          </div>
        )}

        {/* ✅ overflow-x-auto: scroll horizontal se a tela for muito pequena */}
        <div className="relative w-full overflow-x-auto">
          <Table
            className={cn(
              'w-full transition-opacity',
              showTypingHint && hasData && 'opacity-80'
            )}
          >
            <TableHeader className="border-b text-md">
              <TableRow className="h-12 border-none hover:bg-transparent">
                <TableHead className="text-center font-bold text-black whitespace-nowrap">
                  ID
                </TableHead>
                <TableHead className="text-center font-bold text-black whitespace-nowrap">
                  Paciente
                </TableHead>
                <TableHead className="text-center font-bold text-black whitespace-nowrap">
                  Olho
                </TableHead>
                <TableHead className="text-center font-bold text-black whitespace-nowrap">
                  Score IA
                </TableHead>
                <TableHead className="text-center font-bold text-black whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-center font-bold text-black whitespace-nowrap">
                  Data
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {showSkeleton ? (
                <HistoricoSkeleton />
              ) : showError ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="rounded-full bg-red-50 p-4 text-red-500">
                        <AlertCircle className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-slate-900">
                          Não foi possível carregar os exames
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Verifique sua conexão ou tente atualizar a lista
                          novamente.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRefresh}
                        className="rounded-full"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : hasData ? (
                exames.map((exame) => {
                  const score =
                    exame.scoreIA !== null && exame.scoreIA !== undefined
                      ? Number(exame.scoreIA)
                      : null;

                  const lockInfo = editingLocks?.[exame.id];
                  const isBeingEdited = lockInfo?.isBeingEdited ?? false;
                  const editorNome = lockInfo?.editor?.nome ?? null;

                  return (
                    <TableRow
                      key={exame.id}
                      className="group cursor-pointer border-slate-50 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50"
                      tabIndex={0}
                      role="link"
                      aria-label={`Abrir resultado do exame ${exame.id}`}
                      onClick={() =>
                        navigate(`/exames/${encodeURIComponent(exame.id)}`)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/exames/${encodeURIComponent(exame.id)}`);
                        }
                      }}
                    >
                      <TableCell className="py-3 text-center text-sm text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span>{exame.id}</span>
                          {isEspecialista && isBeingEdited && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Badge
                                    variant="outline"
                                    className="border-amber-300 bg-amber-50 text-amber-700 text-xs px-2 py-0.5"
                                  >
                                    Em edição
                                  </Badge>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="border bg-white text-muted-foreground">
                                {editorNome
                                  ? `Em edição por ${editorNome}`
                                  : 'Sendo editado por outro especialista'}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {exame.nomeCompleto}
                      </TableCell>

                      <TableCell className="py-3 text-center text-sm text-muted-foreground whitespace-nowrap">
                        {exame.olho}
                      </TableCell>

                      <TableCell
                        className={cn(
                          'py-3 text-sm text-center font-bold whitespace-nowrap',
                          score !== null
                            ? score > 80
                              ? 'text-red-500'
                              : 'text-green-500'
                            : 'text-muted-foreground/50'
                        )}
                      >
                        {score ?? '--'}
                      </TableCell>

                      <TableCell className="py-3 text-center whitespace-nowrap">
                        <StatusBadge status={exame.status} />
                      </TableCell>

                      <TableCell className="py-3 text-center text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(exame.dtCriacao)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : showEmpty ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="rounded-full bg-slate-50 p-4 text-muted-foreground">
                        <Inbox className="h-8 w-8 opacity-70" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-slate-900">
                          {hasActiveFilters
                            ? 'Nenhum resultado encontrado'
                            : 'Ainda não existem exames registrados'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hasActiveFilters
                            ? 'Tente ajustar os filtros para encontrar outros exames.'
                            : 'Assim que houver exames disponíveis, eles aparecerão aqui.'}
                        </p>
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={limparFiltros}
                          className="rounded-full"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        {pagination && !showError && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              {pagination.pageSize} resultados - Página {pagination.page} de{' '}
              {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={
                  pagination.page <= 1 ||
                  isFetching ||
                  isFetchingPagination ||
                  isTyping
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={
                  pagination.page >= pagination.totalPages ||
                  isFetching ||
                  isFetchingPagination ||
                  isTyping
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}
