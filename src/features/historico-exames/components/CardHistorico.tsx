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
import { Checkbox } from '@/components/ui/checkbox';
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

interface CardHistoricoProps {
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const EXAM_ID_REGEX = /^EX-\d{4}-\d{4}$/i;

function isBuscaId(val: string) {
  return /^ex-/i.test(val) || /^\d/.test(val);
}

type ExamStatusFilter = 'all' | 'CRIADO' | 'CONCLUIDO' | 'EM_PROCESSAMENTO';

export function CardHistorico({
  page = 1,
  pageSize = 20,
  onPageChange,
}: CardHistoricoProps) {
  const navigate = useNavigate();
  const [filtroStatus, setFiltroStatus] = useState<ExamStatusFilter>('all');
  const [busca, setBusca] = useState('');

  const buscaDebounced = useDebouncedValue(busca, 400);

  const isSearchValid = useMemo(() => {
    const valor = busca.trim();

    if (!valor) return true;

    if (isBuscaId(valor)) {
      return EXAM_ID_REGEX.test(valor);
    }

    return true;
  }, [busca]);

  const params = useMemo(
    () => ({
      page,
      pageSize,
      nomeCompleto:
        buscaDebounced.trim() && !EXAM_ID_REGEX.test(buscaDebounced.trim())
          ? buscaDebounced.trim()
          : '',
      id:
        buscaDebounced.trim() && EXAM_ID_REGEX.test(buscaDebounced.trim())
          ? buscaDebounced.trim()
          : '',
      status: filtroStatus === 'all' ? '' : filtroStatus,
    }),
    [page, pageSize, buscaDebounced, filtroStatus]
  );

  const limparFiltros = () => {
    setFiltroStatus('all');
    setBusca('');
    onPageChange?.(1);
  };

  const {
    data: exames = [],
    isLoading,
    isError,
    isFetching,
    isFetched,
    refetch,
  } = useGetExams(params);

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

  const handleRefresh = () => {
    refetch();
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      onPageChange?.(page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.totalPages && page < pagination.totalPages) {
      onPageChange?.(page + 1);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="mx-auto w-full max-w-6xl rounded-3xl border-none bg-white p-10 px-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

            <div className="w-full md:w-60">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mx-auto w-full">
                    <Select
                      value={filtroStatus}
                      onValueChange={(value) => {
                        setFiltroStatus(value as ExamStatusFilter);
                        onPageChange?.(1);
                      }}
                      disabled={showSkeleton}
                    >
                      <SelectTrigger className="flex h-12 w-full items-center justify-between rounded-xl border-slate-200 px-3 text-left focus:ring-1 focus:ring-blue-600">
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
                        'h-12 rounded-xl border-slate-200 pr-10 transition-all focus-visible:ring-blue-600',
                        !isSearchValid &&
                          busca.length > 0 &&
                          'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500'
                      )}
                      value={busca}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        onPageChange?.(1);
                      }}
                      disabled={showSkeleton}
                    />
                    <Search className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>

                <TooltipContent className="border bg-white text-muted-foreground">
                  Busque por Nome ou ID
                </TooltipContent>
              </Tooltip>

              {!isSearchValid && busca.length > 0 && (
                <span className="animate-in fade-in slide-in-from-top-1 absolute -bottom-6 left-1 text-[10px] font-medium text-red-500">
                  Formato de ID inválido
                </span>
              )}
            </div>
          </div>
        </div>

        {(showTypingHint || showBackgroundUpdating) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            {showTypingHint ? 'Buscando...' : 'Atualizando resultados...'}
          </div>
        )}

        <div className="relative">
          <Table
            className={cn(
              'mt-6 transition-opacity',
              showTypingHint && hasData && 'opacity-80'
            )}
          >
            <TableHeader className="border-b text-lg">
              <TableRow className="h-16 border-none hover:bg-transparent">
                <TableHead className="w-12.5" />
                <TableHead className="text-center font-bold text-black">
                  ID
                </TableHead>
                <TableHead className="text-center font-bold text-black">
                  Paciente
                </TableHead>
                <TableHead className="text-center font-bold text-black">
                  Olho
                </TableHead>
                <TableHead className="text-center font-bold text-black">
                  Score IA
                </TableHead>
                <TableHead className="text-center font-bold text-black">
                  Status
                </TableHead>
                <TableHead className="text-center font-bold text-black">
                  Data
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {showSkeleton ? (
                <HistoricoSkeleton />
              ) : showError ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-28">
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
                      <TableCell>
                        <Checkbox className="border-2 transition-colors" />
                      </TableCell>

                      <TableCell className="py-7 text-center text-md text-muted-foreground">
                        {exame.id}
                      </TableCell>

                      <TableCell className="text-center text-md font-medium text-muted-foreground">
                        {exame.nomeCompleto}
                      </TableCell>

                      <TableCell className="text-center text-md text-muted-foreground">
                        {exame.olho}
                      </TableCell>

                      <TableCell
                        className={cn(
                          'text-md text-center font-bold',
                          score !== null
                            ? score > 80
                              ? 'text-red-500'
                              : 'text-green-500'
                            : 'text-muted-foreground/50'
                        )}
                      >
                        {score ?? '--'}
                      </TableCell>

                      <TableCell className="text-center">
                        <StatusBadge status={exame.status} />
                      </TableCell>

                      <TableCell className="text-center text-md text-muted-foreground">
                        {formatDate(exame.dtCriacao)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : showEmpty ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-28">
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
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {pagination.total} resultados - Página {pagination.page} de{' '}
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
