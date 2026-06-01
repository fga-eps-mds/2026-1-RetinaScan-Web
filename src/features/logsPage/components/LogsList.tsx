import { useMemo, useState } from 'react';
import { LogCard } from './LogCard';
import { useGetLogs } from '../hooks/useGetLogs';
import { useDebouncedValue } from '@/features/historico-exames/hooks/useDebounce';
import LogModal from './LogModal';
import type { LogEntry } from '../types/log';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getPresetDateRange(days: number) {
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - days * DAY_IN_MS).toISOString();

  return { startDate, endDate };
}

export function LogsList() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [actionFilter, setActionFilter] = useState('');
  const [datePreset, setDatePreset] = useState<'7' | '30' | 'custom' | ''>('');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [sortByAction, setSortByAction] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const debouncedAction = useDebouncedValue(actionFilter, 300);

  const { data, isLoading, isError, isFetching } = useGetLogs({
    page,
    pageSize,
    action: debouncedAction || undefined,
    startDate,
    endDate,
  });

  const logs = data?.data;
  const total = data?.total ?? 0;

  const debouncedSearch = useDebouncedValue(searchText, 300);

  const visibleLogs = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    let items = (logs ?? []).slice();

    if (term) {
      items = items.filter((log) => {
        const name = (log.actorName ?? '').toString().toLowerCase();
        const email = (log.actorEmail ?? '').toString().toLowerCase();
        return name.includes(term) || email.includes(term);
      });
    }

    if (sortByAction) {
      items.sort((a, b) => (a.action ?? '').localeCompare(b.action ?? ''));
    }

    return items;
  }, [logs, debouncedSearch, sortByAction]);

  const applyPresetRange = (days: 7 | 30) => {
    const range = getPresetDateRange(days);
    setDatePreset(String(days) as '7' | '30');
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setPage(1);
  };

  const updateCustomRange = (nextStart: string, nextEnd: string) => {
    setDatePreset('custom');
    setCustomStart(nextStart);
    setCustomEnd(nextEnd);

    if (nextStart && nextEnd) {
      setStartDate(new Date(nextStart).toISOString());
      setEndDate(new Date(nextEnd).toISOString());
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }

    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              className={`rounded-md px-3 py-2 text-sm ${datePreset === '7' ? 'bg-foreground/5' : 'border'}`}
              onClick={() => applyPresetRange(7)}
            >
              Últimos 7 dias
            </button>
            <button
              className={`rounded-md px-3 py-2 text-sm ${datePreset === '30' ? 'bg-foreground/5' : 'border'}`}
              onClick={() => applyPresetRange(30)}
            >
              Últimos 30 dias
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            placeholder="Buscar usuário ou email"
            className="rounded-md border px-3 py-2 text-sm bg-white"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <input
            placeholder="Filtrar ação (ex: APPROVE)"
            className="rounded-md border px-3 py-2 text-sm bg-white"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sortByAction} onChange={(e) => setSortByAction(e.target.checked)} />
            Ordenar por ação (A→Z)
          </label>
        </div>
      </div>

      {datePreset === 'custom' ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="rounded-md border px-3 py-2 text-sm"
            value={customStart}
            onChange={(e) => updateCustomRange(e.target.value, customEnd)}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2 text-sm"
            value={customEnd}
            onChange={(e) => updateCustomRange(customStart, e.target.value)}
          />
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => {
              setDatePreset('');
              setCustomStart('');
              setCustomEnd('');
              setStartDate(undefined);
              setEndDate(undefined);
              setPage(1);
            }}
          >
            Limpar
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="p-6 text-center text-sm text-muted-foreground">Carregando logs...</div>
      ) : isError ? (
        <div className="p-6 text-center text-sm text-destructive">Erro ao carregar logs.</div>
      ) : (
        visibleLogs.map((log) => (
          <LogCard
            key={log.id}
            log={log}
            onClick={() => setSelectedLog(log)}
          />
        ))
      )}

      <LogModal isOpen={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} log={selectedLog} />

      <div className="flex items-center justify-between border-t border-border/60 px-3 py-4">
        <div className="text-sm text-muted-foreground">
          Página {page} de {Math.max(1, Math.ceil(total / pageSize))} {isFetching ? '(atualizando...)' : ''}
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page * pageSize >= (total || 0)}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
