import { describe, expect, it } from 'vitest';
import { parseApiError } from '@/features/exames/api/parseApiError';

describe('parseApiError (exames)', () => {
  it('retorna mensagem padrao quando corpo e invalido', () => {
    expect(parseApiError(null)).toEqual({
      message: 'Nao foi possivel criar o exame.',
      fieldErrors: {},
    });
  });

  it('prioriza erro de campo quando existir', () => {
    const result = parseApiError({
      message: 'Falha generica.',
      errors: {
        cpf: ['CPF invalido.'],
      },
    });

    expect(result).toEqual({
      message: 'CPF invalido.',
      fieldErrors: {
        cpf: 'CPF invalido.',
      },
    });
  });

  it('usa a mensagem da API quando nao ha erro de campo', () => {
    const result = parseApiError({
      message: 'Erro ao criar exame.',
    });

    expect(result).toEqual({
      message: 'Erro ao criar exame.',
      fieldErrors: {},
    });
  });
});
