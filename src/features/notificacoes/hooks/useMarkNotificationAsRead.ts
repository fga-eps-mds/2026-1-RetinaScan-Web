import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationAsRead } from '../api/markNotificationAsRead';

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueriesData(
        { queryKey: ['notifications'] },
        (
          oldData:
            | Array<
                {
                  id: string;
                  lidaEm: string | null;
                } & Record<string, unknown>
              >
            | undefined
        ) => {
          if (!oldData) return oldData;

          return oldData.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  lidaEm: new Date().toISOString(),
                }
              : item
          );
        }
      );
    },
  });
}
