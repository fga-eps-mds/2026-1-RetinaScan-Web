import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSpecialistReport,
  type CreateSpecialistReportPayload,
} from '../api/createSpecialistReport';

export function useCreateSpecialistReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSpecialistReportPayload) =>
      createSpecialistReport(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['resultado-exame', variables.examId],
      });
    },
  });
}
