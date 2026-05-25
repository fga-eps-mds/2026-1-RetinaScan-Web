import { api } from '@/shared/api';

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/api/notifications/${id}/read`);
}
