import {
  parseApiError as parseSharedApiError,
  type ParsedApiError,
} from '@/shared/parseApiError';


const DEFAULT_MESSAGE = 'Não foi possível cadastrar o usuário.';

// Função para analisar erros da API e retornar uma mensagem padrão
export const parseApiError = (errorBody: unknown): ParsedApiError =>
  parseSharedApiError(errorBody, DEFAULT_MESSAGE);
