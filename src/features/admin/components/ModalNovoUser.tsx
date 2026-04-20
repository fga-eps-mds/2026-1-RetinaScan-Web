import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [crm, setCrm] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createUserMutation = useCreateUser();

  const resetForm = () => {
    setName('');
    setCpf('');
    setCrm('');
    setEmail('');
    setBirthDate('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setFieldErrors({});
  };

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

      resetForm();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border bg-card p-6 shadow-lg sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-semibold mb-4">Cadastro de Usuário</DialogTitle>
        </DialogHeader>

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
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Data de nascimento
              </label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">CPF</label>
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

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter className="mt-2 justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>

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
