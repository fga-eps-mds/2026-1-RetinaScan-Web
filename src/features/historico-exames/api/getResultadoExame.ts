import { api } from '@/shared/api';
import type { ExamResultPayload } from '../types/exam-result';
import { resolveImageUrl } from '@/utils/resolveImageUrl/resolveImageUrl';

type GetResultadoExameResponse = {
  id: string;
  status: 'CRIADO' | 'CONCLUIDO' | 'EM_PROCESSAMENTO' | 'ERRO_PROCESSAMENTO';
  nomeCompleto: string;
  cpf: string;
  sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  dtNascimento: string;
  dtHora: string;
  olho: 'AO' | 'OD' | 'OE' | null;
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
    lateralidadeOlho: 'OD' | 'OE';
    url: string;
    qualidadeImg: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resultadoIa: any;
  }[];
};

export async function getResultadoExame(
  examId: string
): Promise<ExamResultPayload> {
  const response = await api.get<GetResultadoExameResponse>(
    `/api/exams/${encodeURIComponent(examId)}`
  );

  const data = response.data;

  const exam = {
    id: data.id,
    nomeCompleto: data.nomeCompleto,
    cpf: data.cpf,
    sexo: data.sexo,
    dtNascimento: data.dtNascimento,
    dtHora: data.dtHora,
    status: data.status,
    olho: data.olho,
    comorbidades: data.comorbidades
      ? {
          diabetes: data.comorbidades.diabetes,
          diabetesAnos: data.comorbidades.diabetesAnos,
          diabetesUsoInsulina: data.comorbidades.diabetesUsoInsulina ?? false,
          diabetesControlado: data.comorbidades.diabetesControlado ?? false,
          hipertensao: data.comorbidades.hipertensao,
          hipertensaoControlada:
            data.comorbidades.hipertensaoControlada ?? false,
          altaMiopia: data.comorbidades.altaMiopia,
          glaucoma: data.comorbidades.glaucoma,
          usoHidroxicloroquina: data.comorbidades.usoHidroxicloroquina ?? false,
          uveite: data.comorbidades.uveite,
          catarata: data.comorbidades.catarata,
          outrasComorbidades: data.comorbidades.outrasComorbidades ?? false,
          outrasComorbidadesDescricao:
            data.comorbidades.outrasComorbidadesDescricao ?? null,
          qualidadeTecnicaDificuldade:
            data.comorbidades.qualidadeTecnicaDificuldade ?? false,
        }
      : undefined,
    descricao: data.descricao,
    medico: {
      id: data.medico.id,
      nomeCompleto: data.medico.nomeCompleto,
    },
  };

  const imagens = await Promise.all(
    data.imagens.map(async (img) => ({
      id: img.id,
      lateralidadeOlho: img.lateralidadeOlho,
      qualidadeImg: img.qualidadeImg,
      caminhoImg: '',
      url: (await resolveImageUrl(img.url)) ?? '',
    }))
  );

  const resultadosIa = await Promise.all(
    data.imagens
      .filter(
        (
          img
        ): img is typeof img & {
          resultadoIa: NonNullable<typeof img.resultadoIa>;
        } => img.resultadoIa !== null
      )
      .map(async (img) => ({
        id: img.resultadoIa.id,
        idImagem: img.id,
        predictedClass: img.resultadoIa.predictedClass,
        predictedLabel: img.resultadoIa.predictedLabel,
        confidence: img.resultadoIa.confidence,
        probabilities: img.resultadoIa.probabilities ?? {},
        lateralidadeOlho: img.lateralidadeOlho,
        url: (await resolveImageUrl(img.url)) ?? '',
      }))
  );

  return { exam, imagens, resultadosIa };
}