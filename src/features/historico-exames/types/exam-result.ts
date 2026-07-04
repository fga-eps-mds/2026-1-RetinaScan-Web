export type LateralidadeOlho = 'OD' | 'OE';
export type Olho = 'AO' | 'OD' | 'OE' | null;
export type Sexo = 'MASCULINO' | 'FEMININO' | 'OUTRO';
export type ExamStatus =
  | 'CRIADO'
  | 'CONCLUIDO'
  | 'EM_PROCESSAMENTO'
  | 'ERRO_PROCESSAMENTO';

export type Comorbidades = {
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

export type ExamResultImage = {
  id: string;
  lateralidadeOlho: LateralidadeOlho;
  qualidadeImg: string;
  caminhoImg: string;
  url: string;
};

export type ExamResultAiResult = {
  id: string;
  lateralidadeOlho: LateralidadeOlho;
  predictedClass: number;
  predictedLabel: string;
  confidence: number;
  probabilities: {
    normal: number;
    abnormal: number;
  };
  url: string;
};

export type ExamResultExam = {
  id: string;
  nomeCompleto: string;
  cpf: string;
  sexo: Sexo;
  dtNascimento: string;
  dtHora: string;
  status: ExamStatus;
  olho?: Olho;
  comorbidades?: Comorbidades;
  descricao?: string | null;
  medico: {
    id: string;
    nomeCompleto: string;
  };
  laudoEspecialista: LaudoEspecialista | null;
  gradCam: ExamGradCam[] | null;
};

export type LaudoEspecialista = {
  id: string;
  examId: string;
  specialistId: string;
  specialist: {
    id: string;
    nomeCompleto: string;
  };
  texto: string;
  html: string;
  conteudo: string;
  resultadoIaValido: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ExamGradCam = {
  lateralidadeOlho: LateralidadeOlho;
  url: string;
};

export type ExamResultPayload = {
  exam: ExamResultExam;
  imagens: ExamResultImage[];
  resultadosIa: ExamResultAiResult[];
};
