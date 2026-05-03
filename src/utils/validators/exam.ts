
export const isValidExamId = (id: string | undefined): boolean => {
  if (!id) return false;
  
  if (id === 'undefined' || id === 'null') return false;

  return id.trim().length > 0;
};