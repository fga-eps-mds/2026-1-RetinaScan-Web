import {
  parseApiError as parseSharedApiError,
  type ParsedApiError,
} from '@/shared/parseApiError';

const DEFAULT_MESSAGE = 'Nao foi possivel criar o exame.';

export const parseApiError = (errorBody: unknown): ParsedApiError =>
  parseSharedApiError(errorBody, DEFAULT_MESSAGE);
