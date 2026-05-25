import { useQuery } from '@tanstack/react-query';
import {
  type ListNotificationsParams,
  listMyNotifications,
} from '../api/listMyNotifications';
import { notificationsQueryKey } from '../api/notificationsQueryKey';

export function useListNotifications(filters: ListNotificationsParams = {}) {
  return useQuery({
    queryKey: notificationsQueryKey(filters),
    queryFn: () => listMyNotifications(filters),
    staleTime: 30_000,
  });
}
