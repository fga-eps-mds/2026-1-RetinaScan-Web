export function NotificationCardSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="h-14 w-14 animate-pulse rounded-2xl bg-muted" />
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-3 w-120 animate-pulse rounded bg-muted" />
          <div className="h-3 w-88 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
    </div>
  );
}
