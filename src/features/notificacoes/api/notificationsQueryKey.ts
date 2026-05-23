import type { ListNotificationsParams } from './listMyNotifications';

export const notificationsQueryKey = (filters: ListNotificationsParams = {}) =>
  ['notifications', filters] as const;
