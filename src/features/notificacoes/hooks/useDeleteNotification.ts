import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNotification } from '../api/deleteNotification';

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_, notificationId) => {
      queryClient.setQueriesData(
        { queryKey: ['notifications'] },
        (
          oldData:
            | Array<
                {
                  id: string;
                } & Record<string, unknown>
              >
            | undefined
        ) => {
          if (!oldData) return oldData;

          return oldData.filter((item) => item.id !== notificationId);
        }
      );
    },
  });
}
