import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useCreateUser } from '../hooks/useCreateUser';
import { parseApiError } from '../api/parseApiError';

type ModalNovoUserProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
};

const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

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
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [crm, setCrm] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createUserMutation = useCreateUser();

  const handleNovoUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});

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
      await createUserMutation.mutateAsync({
        nomeCompleto: name,
        email,
        cpf: cpf.replace(/\D/g, ''),
        crm: crm.toUpperCase(),
        dtNascimento: birthDate,
        senha: password,
        tipoPerfil: 'MEDICO',
      });

      toast.success('Usuário cadastrado com sucesso.');

      setName('');
      setCpf('');
      setCrm('');
      setEmail('');
      setBirthDate('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setFieldErrors({});

      onUserCreated?.();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const { message, fieldErrors } = parseApiError(err?.response?.data);

      setError(message);
      setFieldErrors(fieldErrors);

      toast.error(message);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-start justify-between gap-4">
          <header className="space-y-2 text-center">
            <h2 className="text-xl font-heading font-bold text-foreground">
              Cadastro de Usuário
            </h2>
          </header>
          <Button type="button" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleNovoUser}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Nome Completo
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Digite o nome do usuário"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                CPF
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                CRM
              </label>
              <div className="relative">
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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                E-mail
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
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
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Data de nascimento
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Senha
                </label>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Digite sua senha"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Confirmação de senha
                </label>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="border-0 text-primary-foreground hover:opacity-90 cursor-pointer"
            >
              {createUserMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ModalNovoUser;
