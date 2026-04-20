import { parseApiError } from '@/features/admin/api/parseApiError';
import { describe, it, expect } from 'vitest';

describe('parseApiError', () => {
  it('deve retornar mensagem padrão quando o erro é inválido ou nulo', () => {
    const defaultMessage = 'Não foi possível cadastrar o usuário.';

    expect(parseApiError(null)).toEqual({
      message: defaultMessage,
      fieldErrors: {},
    });
    expect(parseApiError(undefined)).toEqual({
      message: defaultMessage,
      fieldErrors: {},
    });
    expect(parseApiError('string error')).toEqual({
      message: defaultMessage,
      fieldErrors: {},
    });
  });

  it('deve extrair fieldErrors corretamente de um objeto de erro', () => {
    const errorBody = {
      errors: {
        email: ['E-mail inválido', 'Já existe'],
        password: ['Senha muito curta'],
      },
    };

    const result = parseApiError(errorBody);

    expect(result.fieldErrors).toEqual({
      email: 'E-mail inválido',
      password: 'Senha muito curta',
    });
  });

  it('deve usar a primeira mensagem de fieldErrors como a mensagem principal', () => {
    const errorBody = {
      errors: {
        nome: ['Nome é obrigatório'],
      },
      message: 'Erro genérico',
    };

    const result = parseApiError(errorBody);
    expect(result.message).toBe('Nome é obrigatório');
  });

  it('deve usar body.message se não houver fieldErrors', () => {
    const errorBody = {
      message: 'Token expirado',
      errors: {},
    };

    const result = parseApiError(errorBody);
    expect(result.message).toBe('Token expirado');
  });

  it('deve lidar com erros que possuem a chave errors mas sem mensagens', () => {
    const errorBody = {
      errors: {
        emptyField: [],
        nullField: null,
      },
    };

    const result = parseApiError(errorBody);
    expect(result.fieldErrors).toEqual({});
    expect(result.message).toBe('Não foi possível cadastrar o usuário.');
  });
});
