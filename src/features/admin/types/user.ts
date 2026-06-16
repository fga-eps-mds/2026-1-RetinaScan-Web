export type User = {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf: string;
  crm: string;
  dtNascimento: string;
  tipoPerfil: 'MEDICO' | 'ADMIN' | 'ESPECIALISTA';
  createdAt: string;
  updatedAt: string;
  status: 'ATIVO' | 'INATIVO';
};

export type CreateUserDTO = {
  nomeCompleto: string;
  email: string;
  cpf: string;
  crm: string;
  dtNascimento: string;
  senha: string;
  tipoPerfil: 'ADMIN' | 'MEDICO' | 'ESPECIALISTA';
};
