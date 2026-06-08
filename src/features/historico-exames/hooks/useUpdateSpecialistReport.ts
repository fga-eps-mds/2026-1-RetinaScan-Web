import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSpecialistReport } from '../api/updateSpecialistReport';

type UpdateSpecialistReportPayload = {
  examId: string;
  texto: string;
  resultadoIaValido: boolean;
  html: string;
  json: Record<string, unknown>;
};

type UpdateSpecialistReportResponse = {
  message?: string;
};

export function useUpdateSpecialistReport() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSpecialistReportResponse,
    Error,
    UpdateSpecialistReportPayload
  >({
    mutationFn: updateSpecialistReport,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['resultado-exame', variables.examId],
      });
    },
  });
}
