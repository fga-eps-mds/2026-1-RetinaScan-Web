import { api } from '@/shared/api';
import type { ExamResultPayload } from '../types/exam-result';

export async function getResultadoExame(examId: string) {

  const response = await api.get(`/api/exams/${encodeURIComponent(examId)}`);
  const data = response.data as any;

  const exam = {
    id: data.id,
    idUsuario: data.medico?.id ?? '',
    nomeCompleto: data.nomeCompleto,
    cpf: data.cpf,
    sexo: data.sexo,
    dtNascimento: data.dtNascimento,
    dtHora: typeof data.dtHora === 'string' ? data.dtHora : new Date(data.dtHora).toISOString(),
    status: data.status,
    olho: data.olho ?? null,
    comorbidades: null,
    descricao: data.descricao ?? null,
  };

  const imagens = (data.imagens ?? []).map((img: any) => ({
    id: img.id,
    lateralidadeOlho: img.lateralidadeOlho,
    qualidadeImg: img.qualidadeImg,
    caminhoImg: '',
    url: img.url,
  }));

  const resultadosIa = (data.imagens ?? [])
    .filter((img: any) => img.resultadoIa)
    .map((img: any) => ({
      id: img.resultadoIa.id,
      idImagem: img.id,
      predictedClass: img.resultadoIa.predictedClass,
      predictedLabel: img.resultadoIa.predictedLabel,
      confidence: img.resultadoIa.confidence,
      probabilities: img.resultadoIa.probabilities ?? {},
      lateralidadeOlho: img.lateralidadeOlho,
      url: img.url,
    }));

  return { exam, imagens, resultadosIa } as ExamResultPayload;
}