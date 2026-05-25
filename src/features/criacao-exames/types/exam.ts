export type SexoExame = 'MASCULINO' | 'FEMININO' | 'OUTRO';

export type ComorbidadesDTO = {
  diabetes: boolean;
  diabetesAnos?: number;
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
  outrasComorbidadesDescricao?: string;
  qualidadeTecnicaDificuldade: boolean;
};

export type CreateExamDTO = {
  nomeCompleto: string;
  cpf: string;
  sexo: SexoExame;
  dtNascimento: string;
  dtHora: string;
  comorbidades: ComorbidadesDTO;
  descricao?: string;
};
