import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LogEntry } from '../types/log';

type LogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  log: LogEntry | null;
};

function formatTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
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

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-border/70 bg-muted/40 p-4 text-xs leading-5 text-foreground/90 whitespace-pre-wrap wrap-break-word">
      {JSON.stringify(value ?? null, null, 2)}
    </pre>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground/90">
        {value ?? 'Não informado'}
      </p>
    </div>
  );
}

export default function LogModal({ isOpen, onClose, log }: LogModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-y-auto border border-border bg-card p-6 shadow-2xl sm:max-w-[90vw] sm:rounded-3xl xl:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detalhamento do Log
          </DialogTitle>
        </DialogHeader>

        {log ? (
          <div className="mt-4 space-y-6">
            <section className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                  {formatLabel(log.action)}
                </span>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {formatLabel(log.category)}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {formatTimestamp(log.createdAt)}
                </span>
              </div>

              <p className="text-sm leading-6 text-foreground/90">
                {log.description}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Ator e destino
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <DetailRow label="Nome do ator" value={log.actorName} />
                <DetailRow label="Email do ator" value={log.actorEmail} />
                <DetailRow label="ID do ator" value={log.actorUserId} />
                <DetailRow
                  label="Tipo do destino"
                  value={log.targetEntityType}
                />
                <DetailRow label="ID do destino" value={log.targetEntityId} />
                <DetailRow
                  label="Display do destino"
                  value={log.targetDisplay}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Rastreamento
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <DetailRow label="IP" value={log.ipAddress} />
                <DetailRow label="Request ID" value={log.requestId} />
                <DetailRow label="User agent" value={log.userAgent} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Metadata
              </h3>
              <JsonBlock value={log.metadata} />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Changes
              </h3>
              <JsonBlock value={log.changes} />
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
