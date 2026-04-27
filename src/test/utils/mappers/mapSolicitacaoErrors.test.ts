import { mapSolicitacaoErrors } from '@/utils/mappers/mapSolicitacaoErrors';
import { describe, expect, it } from 'vitest';

describe('mapSolicitacaoErrors', () => {
  it('deve retornar objeto vazio quando não houver fields', () => {
    expect(mapSolicitacaoErrors({})).toEqual({});
    expect(mapSolicitacaoErrors(null)).toEqual({});
    expect(mapSolicitacaoErrors(undefined)).toEqual({});
  });

  it('deve retornar objeto vazio quando fields não for array', () => {
    const error = {
      response: {
        data: {
          fields: 'erro',
        },
      },
    };

    expect(mapSolicitacaoErrors(error)).toEqual({});
  });

  it('deve mapear cpfNovo para novoCpf', () => {
    const error = {
      response: {
        data: {
          fields: [
            {
              path: ['cpfNovo'],
              message: 'CPF inválido',
            },
          ],
        },
      },
    };

    expect(mapSolicitacaoErrors(error)).toEqual({
      novoCpf: 'CPF inválido',
    });
  });

  it('deve mapear crmNovo para novoCrm', () => {
    const error = {
      response: {
        data: {
          fields: [
            {
              path: ['crmNovo'],
              message: 'CRM inválido',
            },
          ],
        },
      },
    };

    expect(mapSolicitacaoErrors(error)).toEqual({
      novoCrm: 'CRM inválido',
    });
  });

  it('deve mapear cpfNovo e crmNovo ao mesmo tempo', () => {
    const error = {
      response: {
        data: {
          fields: [
            {
              path: ['cpfNovo'],
              message: 'CPF obrigatório',
            },
            {
              path: ['crmNovo'],
              message: 'CRM obrigatório',
            },
          ],
        },
      },
    };

    expect(mapSolicitacaoErrors(error)).toEqual({
      novoCpf: 'CPF obrigatório',
      novoCrm: 'CRM obrigatório',
    });
  });

  it('deve ignorar campos sem path ou sem message', () => {
    const error = {
      response: {
        data: {
          fields: [
            { path: ['cpfNovo'] },
            { message: 'Mensagem sem path' },
            { path: [], message: 'Path vazio' },
            { path: ['crmNovo'], message: '' },
          ],
        },
      },
    };

    expect(mapSolicitacaoErrors(error)).toEqual({});
  });

  it('deve ignorar campos não mapeados', () => {
    const error = {
      response: {
        data: {
          fields: [
            {
              path: ['email'],
              message: 'Email inválido',
            },
          ],
        },
      },
    };

    expect(mapSolicitacaoErrors(error)).toEqual({});
  });

  it('deve ler fields direto de error.fields', () => {
    const error = {
      fields: [
        {
          path: ['cpfNovo'],
          message: 'CPF já cadastrado',
        },
      ],
    };

    expect(mapSolicitacaoErrors(error)).toEqual({
      novoCpf: 'CPF já cadastrado',
    });
  });
});
