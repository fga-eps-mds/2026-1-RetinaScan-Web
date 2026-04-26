export const userKeys = {
  all: ['users'] as const,
  list: ['users', 'list'] as const,
  profile: ['users', 'me'] as const,

  solicitacoesCpfCrm: ['users', 'solicitacoes-cpf-crm'] as const,
  solicitacoesCpfCrmList: ['users', 'solicitacoes-cpf-crm', 'list'] as const,
  minhasSolicitacoesCpfCrm: ['users', 'solicitacoes-cpf-crm', 'me'] as const,
}