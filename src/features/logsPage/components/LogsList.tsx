import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Search, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { LogCard } from './LogCard';
import LogModal from './LogModal';
import { useGetLogs } from '../hooks/useGetLogs';
import { useDebouncedValue } from '@/features/historico-exames/hooks/useDebounce';
import type { LogEntry } from '../types/log';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getPresetDateRange(days: number) {
  const now = new Date();
  return {
    from: new Date(now.getTime() - days * DAY_IN_MS),
    to: now,
  };
}

function toIsoRange(range?: DateRange) {
  if (!range?.from || !range?.to) {
    return { startDate: undefined, endDate: undefined };
  }

  const start = new Date(range.from);
  start.setHours(0, 0, 0, 0);

  const end = new Date(range.to);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

type Preset = '7' | '30' | 'custom' | '';

const ACTION_OPTIONS = [
  'APPROVE',
  'REJECT',
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
];

export function LogsList() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sortByAction, setSortByAction] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const [datePreset, setDatePreset] = useState<Preset>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const debouncedSearch = useDebouncedValue(searchText, 300);
  const debouncedAction = useDebouncedValue(actionFilter, 300);

  const apiDateRange = useMemo(() => {
    if (datePreset === '7') return toIsoRange(getPresetDateRange(7));
    if (datePreset === '30') return toIsoRange(getPresetDateRange(30));
    if (datePreset === 'custom') return toIsoRange(dateRange);

    return { startDate: undefined, endDate: undefined };
  }, [datePreset, dateRange]);

  const { data, isLoading, isError, isFetching } = useGetLogs({
    page,
    pageSize,
    action: debouncedAction || undefined,
    startDate: apiDateRange.startDate,
    endDate: apiDateRange.endDate,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const visibleLogs = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    let items = [...logs];

    if (term) {
      items = items.filter((log) => {
        const name = (log.actorName ?? '').toLowerCase();
        const email = (log.actorEmail ?? '').toLowerCase();
        return name.includes(term) || email.includes(term);
      });
    }

    if (sortByAction) {
      items.sort((a, b) => (a.action ?? '').localeCompare(b.action ?? ''));
    }

    return items;
  }, [logs, debouncedSearch, sortByAction]);

  const clearDateFilter = () => {
    setDatePreset('');
    setDateRange(undefined);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchText('');
    setActionFilter('');
    setSortByAction(false);
    setDatePreset('');
    setDateRange(undefined);
    setPage(1);
  };

  const hasFilters =
    !!searchText.trim() || !!actionFilter || !!datePreset || sortByAction;

  const dateLabel = useMemo(() => {
    if (datePreset === '7') return 'Últimos 7 dias';
    if (datePreset === '30') return 'Últimos 30 dias';
    if (datePreset === 'custom' && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
    return 'Período';
  }, [datePreset, dateRange]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.3fr)_220px_auto_auto]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por usuário ou email"
                className="pl-9"
              />
            </div>

            <Select
              value={actionFilter || 'all'}
              onValueChange={(value) => {
                setActionFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="hover:cursor-pointer">
                <SelectValue placeholder="Filtrar ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {ACTION_OPTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={datePreset === '7' ? 'default' : 'outline'}
                onClick={() => {
                  setDatePreset('7');
                  setDateRange(undefined);
                  setPage(1);
                }}
              >
                7 dias
              </Button>

              <Button
                type="button"
                variant={datePreset === '30' ? 'default' : 'outline'}
                onClick={() => {
                  setDatePreset('30');
                  setDateRange(undefined);
                  setPage(1);
                }}
              >
                30 dias
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={datePreset === 'custom' ? 'default' : 'outline'}
                    className={cn(
                      'justify-start text-left font-normal',
                      !dateRange?.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {dateLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onSelect={(range: any) => {
                      setDatePreset('custom');
                      setDateRange(range);
                      setPage(1);
                    }}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 rounded-md border px-3">
              <Checkbox
                id="sort-action"
                checked={sortByAction}
                onCheckedChange={(checked) => setSortByAction(Boolean(checked))}
              />
              <label
                htmlFor="sort-action"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Ordenar por ação
              </label>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={clearAllFilters}
            disabled={!hasFilters}
          >
            Limpar filtros
          </Button>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {!!searchText.trim() && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                Busca: {searchText.trim()}
                <button
                  type="button"
                  onClick={() => {
                    setSearchText('');
                    setPage(1);
                  }}
                  className="ml-1 inline-flex"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {!!actionFilter && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                Ação: {actionFilter}
                <button
                  type="button"
                  onClick={() => {
                    setActionFilter('');
                    setPage(1);
                  }}
                  className="ml-1 inline-flex"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {!!datePreset && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                {dateLabel}
                <button
                  type="button"
                  onClick={clearDateFilter}
                  className="ml-1 inline-flex"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {sortByAction && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                Ordenado por ação
                <button
                  type="button"
                  onClick={() => setSortByAction(false)}
                  className="ml-1 inline-flex"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Carregando logs...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          Erro ao carregar logs.
        </div>
      ) : visibleLogs.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum log encontrado com os filtros atuais.
        </div>
      ) : (
        visibleLogs.map((log) => (
          <LogCard key={log.id} log={log} onClick={() => setSelectedLog(log)} />
        ))
      )}

      <LogModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />

      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <div className="text-sm text-muted-foreground">
          Página {page} de {totalPages} {isFetching ? '(atualizando...)' : ''}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
