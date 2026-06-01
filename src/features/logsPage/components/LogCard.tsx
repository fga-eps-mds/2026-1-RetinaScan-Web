
import type { MouseEventHandler } from 'react';
import { useLogStickerColor } from '../hooks/useLogStickerColor';
import type { LogEntry } from '../types/log';

type LogCardProps = {
  log: LogEntry;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

function formatTimestamp(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function LogCard({
  log,
  onClick,
}: LogCardProps) {
  const {
    action,
    category,
    description,
    actorName,
    actorEmail,
    targetEntityType,
    targetDisplay,
    createdAt,
  } = log;
  const actorLabel = actorName ?? actorEmail ?? 'Usuário não identificado';
  const targetLabel =
    targetDisplay ?? targetEntityType ?? 'Sem destino informado';
  const getStickerColor = useLogStickerColor();
  const stickerColor = getStickerColor(action, category);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-border/70 bg-white text-left shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftColor: stickerColor, borderLeftWidth: '12px' }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
              {formatLabel(action)}
            </span>
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {formatLabel(category)}
            </span>
          </div>

          <p className="text-sm leading-6 text-foreground/90">{description}</p>

          <div className="grid text-sm leading-6 text-foreground/90">
            <div>
              <p className="font-medium text-foreground/85">Nome: {actorLabel}</p>
              {actorEmail ? <p className="text-foreground/85">Email: {actorEmail}</p> : null}
            </div>

            <div>
              <p className="font-medium text-foreground/85">Destino: {targetLabel}</p>
              <p className="text-foreground/85">
                {targetEntityType ? formatLabel(targetEntityType) : 'Alvo do evento'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          {formatTimestamp(createdAt)}
        </div>
      </div>
    </button>
  );
}
