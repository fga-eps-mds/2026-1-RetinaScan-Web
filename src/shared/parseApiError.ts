export type ParsedApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

type ErrorBody = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
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

  const firstFieldError = Object.values(fieldErrors)[0];

  return {
    message: firstFieldError || body.message || defaultMessage,
    fieldErrors,
  };
};
