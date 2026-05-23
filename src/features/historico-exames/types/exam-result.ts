export type ExamResultImage = {
  id: string;
  lateralidadeOlho: 'OD' | 'OE';
  qualidadeImg: string;
  caminhoImg: string;
  url: string;
};

export type ExamResultAiResult = {
  id: string;
  idImagem: string;
  predictedClass: number;
  predictedLabel: string;
  confidence: number;
  probabilities: Record<string, number>;
  lateralidadeOlho: 'OD' | 'OE';
  url: string;
};

export type ExamResultExam = {
  id: string;
  idUsuario: string;
  nomeCompleto: string;
  cpf: string;
  sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  dtNascimento: string;
  dtHora: string;
  status: 'CRIADO' | 'CONCLUIDO' | 'EM_PROCESSAMENTO' | 'ERRO_PROCESSAMENTO';
  olho?: 'AO' | 'OD' | 'OE' | null;
  comorbidades?: string | null;
  descricao?: string | null;
};

export type ExamResultPayload = {
  exam: ExamResultExam;
  imagens: ExamResultImage[];
  resultadosIa: ExamResultAiResult[];
};