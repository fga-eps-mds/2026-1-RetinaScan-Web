import { api } from '@/shared/api';

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

export async function updateSpecialistReport({
  examId,
  texto,
  resultadoIaValido,
  html,
  json,
}: UpdateSpecialistReportPayload): Promise<UpdateSpecialistReportResponse> {
  const response = await api.put<UpdateSpecialistReportResponse>(
    `/api/report/${examId}/update`,
    {
      texto,
      resultadoIaValido,
      html,
      json,
    }
  );

  return response.data;
}
