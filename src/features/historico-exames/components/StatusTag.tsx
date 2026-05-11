import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

const STATUS_STYLES = {
  criado: 'border border-yellow-200 bg-yellow-50 text-yellow-800',
  concluido: 'border border-green-200 bg-green-50 text-green-800',
  em_processamento: 'border border-blue-200 bg-blue-50 text-blue-800',
  default: 'border border-slate-200 bg-slate-50 text-slate-700',
} as const;

function normalizeStatus(status?: string | null) {
  return (status ?? '').trim().toLowerCase();
}

function formatStatusLabel(status?: string | null) {
  if (!status?.trim()) return 'Não informado';

  return status
    .trim()
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusStyles(status?: string | null) {
  const normalized = normalizeStatus(status);

  return (
    STATUS_STYLES[normalized as keyof typeof STATUS_STYLES] ??
    STATUS_STYLES.default
  );
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = formatStatusLabel(status);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        getStatusStyles(status),
        className
      )}
      aria-label={`Status: ${label}`}
      title={label}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
