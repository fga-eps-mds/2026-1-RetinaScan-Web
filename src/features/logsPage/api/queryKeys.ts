export const logsKeys = {
  all: ['logs'] as const,
  list: (params: Record<string, unknown>) => ['logs', 'list', params] as const,
};
