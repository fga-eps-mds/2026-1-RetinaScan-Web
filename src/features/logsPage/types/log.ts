export type LogEntry = {
  id: string;
  action: string;
  category: string;
  description: string;
  actorUserId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  targetEntityType?: string | null;
  targetEntityId?: string | null;
  targetDisplay?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string | Date;
};
