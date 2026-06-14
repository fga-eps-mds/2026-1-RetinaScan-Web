import { api } from "@/shared/api";

export const downloadLaudoApi = async (exameId: string): Promise<Blob> => {
  // O responseType: 'blob' é obrigatório para não corromper o PDF
  const response = await api.get(`/exames/${exameId}/laudo`, {
    responseType: 'blob', 
  });

  return response.data;
};