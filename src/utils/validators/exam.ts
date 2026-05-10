export const isValidExamId = (id: string | undefined): boolean => {
  if (!id) return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(id);

  
};

export const sanitizeExamSearch = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9-]/g, '');
};

export const isValidExamIdPattern = (id: string): boolean => {
  if (!id) return true;
 
  const pattern = /^EX-\d{4}-\d{4}$/;
  return pattern.test(id);
};