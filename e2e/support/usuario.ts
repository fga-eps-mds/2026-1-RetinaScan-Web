import { cpf } from 'cpf-cnpj-validator';

export const uniqueCPF = cpf.generate();

export function generateCRM(uf = 'DF'): string {
  const number = Math.floor(100000 + Math.random() * 900000);
  return `${number}${uf}`;
}

export function uniqueEmail() {
    return `usuario-${crypto.randomUUID()}@retinascan.local`;
}