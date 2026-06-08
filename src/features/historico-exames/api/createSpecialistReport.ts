import { api } from '@/shared/api';

export type CreateSpecialistReportPayload = {
  examId: string;
  texto: string;
  html: string;
  json: Record<string, unknown> | null;
  resultadoIaValido: boolean;
};

export type CreateSpecialistReportResponse = {
  id: string;
  examId: string;
  specialistId: string;
  texto: string;
  html: string;
  json: Record<string, unknown> | null;
  resultadoIaValido: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function createSpecialistReport(
  payload: CreateSpecialistReportPayload
) {
  const { examId, ...body } = payload;

  const response = await api.post<CreateSpecialistReportResponse>(
    `/api/report/${examId}/create`,
    body
  );

  return response.data;
}
