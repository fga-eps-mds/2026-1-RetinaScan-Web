type ParsedApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

export const parseApiError = (errorBody: unknown): ParsedApiError => {
  if (!errorBody || typeof errorBody !== 'object') {
    return {
      message: 'Nao foi possivel criar o exame.',
      fieldErrors: {},
    };
  }

  const body = errorBody as {
    message?: string;
    errors?: Record<string, string[] | undefined>;
  };

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
    message: firstFieldError || body.message || 'Nao foi possivel criar o exame.',
    fieldErrors,
  };
};
