
import { useLogStickerColor } from '../hooks/useLogStickerColor';

type LogCardProps = {
  action: string;
  category: string;
  description: string;
  actorName?: string | null;
  actorEmail?: string | null;
  targetEntityType?: string | null;
  targetDisplay?: string | null;
  createdAt: Date | string;
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
  action,
  category,
  description,
  actorName,
  actorEmail,
  targetEntityType,
  targetDisplay,
  createdAt,
}: LogCardProps) {
  const actorLabel = actorName ?? actorEmail ?? 'Usuário não identificado';
  const targetLabel =
    targetDisplay ?? targetEntityType ?? 'Sem destino informado';
  const getStickerColor = useLogStickerColor();
  const stickerColor = getStickerColor(action, category);

  return (
    <article
      className="group rounded-2xl border border-border/70 bg-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeftColor: stickerColor, borderLeftWidth: '12px' }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-foreground/5 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80">
              {formatLabel(action)}
            </span>
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {formatLabel(category)}
            </span>
          </div>

          <p className="text-sm leading-6 text-foreground/90">{description}</p>

          <div className="grid text-sm leading-6 text-foreground/90">
            <div>
              <p className="font-medium text-foreground/85">{actorLabel}</p>
              {actorEmail ? <p className="text-foreground/85">{actorEmail}</p> : null}
            </div>

            <div>
              <p className="font-medium text-foreground/85">{targetLabel}</p>
              <p className="text-foreground/85">
                {targetEntityType ? formatLabel(targetEntityType) : 'Alvo do evento'}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 rounded-full bg-foreground/5 px-3 py-2 text-xs font-medium text-muted-foreground">
          {formatTimestamp(createdAt)}
        </div>
      </div>
    </article>
  );
}
