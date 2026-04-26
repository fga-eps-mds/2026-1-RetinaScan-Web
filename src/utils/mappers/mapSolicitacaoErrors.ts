export const mapSolicitacaoErrors = (error: unknown) => {
  const nextErrors: Record<string, string> = {};

  const apiFields =
    (error as any)?.response?.data?.fields ??
    (error as any)?.fields ??
    [];

  if (!Array.isArray(apiFields)) return nextErrors;

  for (const field of apiFields) {
    const path = field?.path?.[0];
    const message = field?.message;

    if (!path || !message) continue;

    if (path === 'cpfNovo') nextErrors.novoCpf = message;
    if (path === 'crmNovo') nextErrors.novoCrm = message;
  }

  return nextErrors;
};