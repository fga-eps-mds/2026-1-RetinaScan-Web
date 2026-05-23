import { api } from '@/shared/api';
import type { ExamResultPayload } from '../types/exam-result';
import { resolveImageUrl } from '@/utils/resolveImageUrl/resolveImageUrl';

type GetResultadoExameResponse = {
  id: string;
  status: string;
  nomeCompleto: string;
  cpf: string;
  sexo: string;
  dtNascimento: string;
  dtHora: string;
  olho: string;
  comorbidades?: {
    diabetes: boolean;
    diabetesAnos: number | null;
    diabetesUsoInsulina: boolean;
    diabetesControlado: boolean;
    hipertensao: boolean;
    hipertensaoControlada: boolean;
    altaMiopia: boolean;
    glaucoma: boolean;
    usoHidroxicloroquina: boolean;
    uveite: boolean;
    catarata: boolean;
    outrasComorbidades: boolean;
    outrasComorbidadesDescricao: string | null;
    qualidadeTecnicaDificuldade: boolean;
  };
  descricao: string | null;
  medico: {
    id: string;
    nomeCompleto: string;
  };
  imagens: {
    id: string;
    lateralidadeOlho: string;
    url: string;
    qualidadeImg: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resultadoIa: any;
  }[];
};

export async function getResultadoExame(examId: string) {
  const response = await api.get<GetResultadoExameResponse>(
    `/api/exams/${encodeURIComponent(examId)}`
  );
  const data = response.data;

  const exam = {
    id: data.id,
    idUsuario: data.medico?.id ?? '',
    nomeCompleto: data.nomeCompleto,
    cpf: data.cpf,
    sexo: data.sexo,
    dtNascimento: data.dtNascimento,
    dtHora:
      typeof data.dtHora === 'string'
        ? data.dtHora
        : new Date(data.dtHora).toISOString(),
    status: data.status,
    olho: data.olho ?? null,
    comorbidades: data.comorbidades ?? undefined,
    descricao: data.descricao ?? null,
  };

  const imagens = await Promise.all(
    (data.imagens ?? []).map(async (img) => ({
      id: img.id,
      lateralidadeOlho: img.lateralidadeOlho,
      qualidadeImg: img.qualidadeImg,
      caminhoImg: '',
      url: await resolveImageUrl(img.url),
    }))
  );

  const resultadosIa = await Promise.all(
    (data.imagens ?? [])
      .filter((img) => img.resultadoIa)
      .map(async (img) => ({
        id: img.resultadoIa.id,
        idImagem: img.id,
        predictedClass: img.resultadoIa.predictedClass,
        predictedLabel: img.resultadoIa.predictedLabel,
        confidence: img.resultadoIa.confidence,
        probabilities: img.resultadoIa.probabilities ?? {},
        lateralidadeOlho: img.lateralidadeOlho,
        url: await resolveImageUrl(img.url),
      }))
  );

  return { exam, imagens, resultadosIa } as ExamResultPayload;
}
