export type SexoExame = 'MASCULINO' | 'FEMININO' | 'OUTRO';

export type CreateExamDTO = {
  nomeCompleto: string;
  cpf: string;
  sexo: SexoExame;
  dtNascimento: string;
  dtHora: string;
  comorbidades?: string;
  descricao?: string;
};
