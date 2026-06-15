export type ParsedApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

type ErrorBody = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
  fields?: Array<{
    path?: Array<string | number>;
    message?: string;
  }>;
};

export const parseApiError = (
  errorBody: unknown,
  defaultMessage: string,
): ParsedApiError => {
  if (!errorBody || typeof errorBody !== 'object') {
    return {
      message: defaultMessage,
      fieldErrors: {},
    };
  }

  const body = errorBody as ErrorBody;
  const fieldErrors: Record<string, string> = {};

  if (body.errors) {
    for (const [field, messages] of Object.entries(body.errors)) {
      if (messages?.length) {
        fieldErrors[field] = messages[0];
      }
    }
  }

  if (body.fields) {
    for (const field of body.fields) {
      const fieldName = field.path?.[0];
      if (typeof fieldName === 'string' && field.message && !fieldErrors[fieldName]) {
        fieldErrors[fieldName] = field.message;
      }
    }
  }

  const firstFieldError = Object.values(fieldErrors)[0];

  return {
    message: firstFieldError || body.message || defaultMessage,
    fieldErrors,
  };
};
