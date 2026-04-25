const formatCrm = (value: string): string => {
  const normalized = value.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const crmNumber = normalized.replace(/[A-Z]/g, '').slice(0, 6);
  const crmUf = normalized.replace(/[0-9]/g, '').slice(0, 2);

  return crmUf ? `${crmNumber}/${crmUf}` : crmNumber;
};

export { formatCrm };