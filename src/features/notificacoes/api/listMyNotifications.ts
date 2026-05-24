import { api } from '@/shared/api';

export type NotificationStatusFilter = 'todas' | 'nao-lidas' | 'lidas';
export type NotificationType =
  | 'avaliacao_ia_atualizada'
  | 'avaliacao_ia_revisada_por_especialista'
  | 'status_solicitacao_cadastral_atualizado';

export type NotificationItem = {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  dados: Record<string, unknown> | null;
  lidaEm: string | null;
  createdAt: string;
};

export type ListNotificationsParams = {
  status?: NotificationStatusFilter;
  tipo?: NotificationType;
  limit?: number;
};

export async function listMyNotifications(params: ListNotificationsParams) {
  const search = new URLSearchParams();

  if (params.status) search.append('status', params.status);
  if (params.tipo) search.append('tipo', params.tipo);
  if (params.limit) search.append('limit', String(params.limit));

  const query = search.toString();
  const url = `/api/notifications/me${query ? `?${query}` : ''}`;

  const response = await api.get<NotificationItem[]>(url);

  return response.data;
}
