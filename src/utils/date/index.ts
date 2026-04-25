
export const formatDateLabel = (dateValue?: Date | string | null) => {
  if (!dateValue) return 'Não informada';

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  return Number.isNaN(date.getTime())
    ? 'Não informada'
    : new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateInput = (dateValue?: Date | string | null) => {
  if (!dateValue) return '';

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  if (year < 1900 || year > 2100) return  '';

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};
