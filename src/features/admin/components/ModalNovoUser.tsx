import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useCreateUser } from '../hooks/useCreateUser';
import { parseApiError } from '../api/parseApiError';

// Contrato de propriedades do componente, definindo o controle de estado vindo do pai
// e um callback opcional (onUserCreated) para acionar refetches (atualização da listagem) após o sucesso.
type ModalNovoUserProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
};

// Utilitário de formatação para CPF.
// Remove todos os não-dígitos e aplica a máscara 000.000.000-00 progressivamente.
const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Utilitário de formatação para CRM.
// Isola os 6 primeiros números e os 2 primeiros caracteres alfabéticos (UF), separando-os com "/".
const formatCrm = (value: string): string => {
  const normalized = value.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const crmNumber = normalized.replace(/[A-Z]/g, '').slice(0, 6);
  const crmUf = normalized.replace(/[0-9]/g, '').slice(0, 2);

  return crmUf ? `${crmNumber}/${crmUf}` : crmNumber;
};

const ModalNovoUser = ({
  isOpen,
  onClose,
  onUserCreated,
}: ModalNovoUserProps) => {
  
  // --- Gestão de Estados Form ---
  // Estados individuais para cada campo do formulário. A adoção de states simples (em detrimento 
  // de libs como React Hook Form) atende bem a este caso de uso direto e de baixa complexidade.
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [crm, setCrm] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState<'MEDICO' | 'ESPECIALISTA'>('MEDICO');
  
  // --- Gestão de Erros ---
  // error: armazena mensagens globais de erro (ex: senhas não coincidem ou erro 500)
  // fieldErrors: mapeia erros específicos retornados pela API (ex: 400 Bad Request) para o campo correspondente.
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Hook do TanStack Query encarregado de disparar a mutation (POST) para criar o usuário.
  const createUserMutation = useCreateUser();

  // Função utilitária para higienizar o estado do formulário após um fechamento ou cadastro bem-sucedido.
  const resetForm = () => {
    setName('');
    setCpf('');
    setCrm('');
    setEmail('');
    setBirthDate('');
    setPassword('');
    setConfirmPassword('');
    setTipoPerfil('MEDICO');
    setError(null);
    setFieldErrors({});
  };

  // Handler principal acionado no submit do formulário.
  const handleNovoUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previne o reload padrão da página gerado pelo <form>

    // Limpa erros residuais da tentativa anterior
    setError(null);
    setFieldErrors({});

    // Validação cliente-side básica (Client-side validation)
    if (password !== confirmPassword) {
      const message = 'As senhas não coincidem.';

      setError(message);
      setFieldErrors({
        password: message,
        confirmPassword: message,
      });

      toast.error(message);
      return;
    }

    try {
      // Dispara a mutation de forma assíncrona. Note que o payload sanitiza o CPF
      // (removendo a máscara) e força o CRM para maiúsculo, garantindo a integridade dos dados no banco.
      await createUserMutation.mutateAsync({
        nomeCompleto: name,
        email,
        cpf: cpf.replace(/\D/g, ''),
        crm: crm.toUpperCase(),
        dtNascimento: birthDate,
        senha: password,
        tipoPerfil,
      });

      // Feedback visual positivo na interface
      toast.success('Usuário cadastrado com sucesso.');

      // Fluxo de cleanup: limpa os dados da memória, notifica o componente pai (para refetch da tabela) e fecha o modal.
      resetForm();
      onUserCreated?.();
      onClose();
    } catch (err: unknown) {
      // Fazemos um casting seguro apenas na hora de acessar as propriedades da resposta da API,
      // evitando o uso de 'any' e respeitando as regras do linter.
      const apiError = err as { response?: { data?: unknown } };
      
      // Catch e tratamento estruturado de exceções vindas da API (ex: conflitos de e-mail ou validações falhas do DTO backend)
      const { message, fieldErrors } = parseApiError(apiError?.response?.data);

      setError(message);
      setFieldErrors(fieldErrors);

      toast.error(message);
    }
  };

  return (
    // Dialog não obstrutivo utilizando o Radix UI por baixo dos panos (via shadcn/ui)
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* O DialogContent está estilizado para ser responsivo e aplicar scroll interno (overflow-y-auto) 
          caso o formulário ultrapasse o view-height da janela em telas menores */}
      <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] xl:max-w-3xl max-h-[90vh] overflow-y-auto border border-border bg-card p-6 shadow-2lg sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">
            Cadastro de Usuário
          </DialogTitle>
        </DialogHeader>

        {/* Início do Form. Todo o layout interno utiliza Grid e Flexbox nativos do Tailwind para alinhamento */}
        <form className="space-y-4" onSubmit={handleNovoUser}>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Nome Completo</label>
            <Input
              type="text"
              placeholder="Digite o nome do usuário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              // O onChange limpa dinamicamente os erros específicos de campo quando o usuário volta a digitar, 
              // melhorando a UX e indicando que o erro foi "visto".
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }}
              required
            />
            {/* Renderização condicional da mensagem de erro devolvida pelo backend associada a este input */}
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Data de nascimento</label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          {/* Grid de 2 colunas para otimização de espaço em desktop, colapsando para 1 coluna no mobile */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">CPF</label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                // O valor injetado no onChange é interceptado pela função de formatação
                onChange={(e) => {
                  setCpf(formatCpf(e.target.value));
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.cpf;
                    return next;
                  });
                }}
                required
              />
              {fieldErrors.cpf && (
                <p className="text-xs text-destructive">{fieldErrors.cpf}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">CRM</label>
              <Input
                type="text"
                placeholder="000000/UF"
                value={crm}
                onChange={(e) => {
                  setCrm(formatCrm(e.target.value));
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.crm;
                    return next;
                  });
                }}
                required
              />
              {fieldErrors.crm && (
                <p className="text-xs text-destructive">{fieldErrors.crm}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
              {fieldErrors.password && (
                <p className="text-xs text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Confirmação de senha
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                required
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* O select utiliza a mesma estrutura de grid de 2 colunas, mas como há apenas ele dentro do grid pai, 
              ele ocupa a primeira coluna mantendo o mesmo tamanho exato do input de Senha. */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Perfil do Usuário</label>
              {/* O onValueChange encapsula a string selecionada tipando-a estritamente com o Literal Type */}
              <Select
                value={tipoPerfil}
                onValueChange={(value: 'MEDICO' | 'ESPECIALISTA') => setTipoPerfil(value)}
              >
                {/* O w-full força o SelectTrigger a utilizar todo o espaço disponível do grid column container */}
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="MEDICO">Médico</SelectItem>
                  <SelectItem value="ESPECIALISTA">Médico Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fallback de erro global (ex: timeout, erro não mapeado no parseApiError) */}
          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter className="mt-2 justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>

            {/* O atributo disabled reage ao estado isPending da mutation para impedir duplicação de requisições e envios acidentais. */}
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="border-0 text-primary-foreground hover:opacity-90"
            >
              {createUserMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalNovoUser;