import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCpf, formatCrm } from '@/utils/formatters';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/parseApiError';
import { useCreateUser } from '../hooks/useCreateUser';
import { useValidateInscricaoToken } from '../hooks/useValidateInscricaoToken';

type ModalNovaInscricaoParams = {
  token?: string;
};

const ModalNovaInscricao = () => {
  const [searchParams] = useSearchParams();
  const { token } = searchParams.get('token') as ModalNovaInscricaoParams;
  const normalizedToken = token?.trim() || '';

  const validationQuery = useValidateInscricaoToken(normalizedToken);

  const inviteLabel = useMemo(() => {
    if (!validationQuery.data) return '';

    const profile = validationQuery.data.tipoPerfil
      ? validationQuery.data.tipoPerfil === 'MEDICO'
        ? 'Médico'
        : 'Especialista'
      : 'Convite para inscrição';

    return profile;
  }, [validationQuery.data]);

  const [tipoPerfil, setTipoPerfil] = useState(inviteLabel);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [crm, setCrm] = useState('');
  const [dtNascimento, setDtNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (validationQuery.data?.nomeCompleto && !nomeCompleto) {
      setNomeCompleto(validationQuery.data.nomeCompleto);
    }
  }, [nomeCompleto, validationQuery.data]);

  const passwordMismatch =
    senha && confirmacaoSenha && senha !== confirmacaoSenha;

  const validationErrorMessage =
    validationQuery.error instanceof Error
      ? validationQuery.error.message
      : 'Link inválido ou expirado.';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!normalizedToken) {
      const message = 'Token ausente na URL.';
      setError(message);
      toast.error(message);
      return;
    }

    if (senha !== confirmacaoSenha) {
      const message = 'As senhas não coincidem.';
      setError(message);
      setFieldErrors({ senha: message, confirmacaoSenha: message });
      toast.error(message);
      return;
    }

    try {
      await useCreateUser().mutateAsync({
        nomeCompleto,
        cpf: cpf.replace(/\D/g, ''),
        crm: crm.toUpperCase(),
        dtNascimento,
        senha,
        tipoPerfil: validationQuery.data?.tipoPerfil || 'MEDICO', // Usa o tipo de perfil do convite
        email: validationQuery.data?.email || '', // Usa o email do convite
      });
      setSuccess(true);
      toast.success('Sua inscrição foi recebida com sucesso.');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: unknown } };
      const parsed = parseApiError(
        apiError?.response?.data,
        'Não foi possível concluir a inscrição.'
      );

      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      toast.error(parsed.message);
    }
  };

  if (!normalizedToken || validationQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF6FF] px-6">
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7000B]/10">
            <ShieldCheck className="h-7 w-7 text-[#E7000B]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-[#12223A]">
              Link de inscrição inválido
            </h1>
            <p className="text-sm text-muted-foreground">
              {normalizedToken
                ? validationErrorMessage
                : 'O link recebido não contém o token necessário para abrir o formulário.'}
            </p>
          </div>

          <Button
            asChild
            className="h-11 w-full gap-2 bg-[#1A63AB] font-semibold text-white transition-all hover:bg-[#1A63AB]/90"
          >
            <Link to="/login">
              Ir para o login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (validationQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF6FF] px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#1A63AB]/10 bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-sm font-medium text-muted-foreground">
            Validando seu convite...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF6FF] px-6">
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1A63AB]/10">
            <CheckCircle2 className="h-7 w-7 text-[#1A63AB]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-[#12223A]">
              Inscrição enviada
            </h1>
            <p className="text-sm text-muted-foreground">
              Recebemos seus dados. Agora basta aguardar a análise da equipe.
            </p>
          </div>

          <Button
            asChild
            className="h-11 w-full gap-2 bg-[#1A63AB] font-semibold text-white transition-all hover:bg-[#1A63AB]/90"
          >
            <Link to="/login">
              Ir para o login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(26,99,171,0.14),transparent_38%),linear-gradient(180deg,#EFF6FF_0%,#F8FBFF_100%)] px-6 py-10 lg:px-10">
      <div className="mx-auto grid items-center justify-center mt-30">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-heading font-bold text-[#12223A]">
            Dados de inscrição
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete as informações abaixo para enviar sua solicitação.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#12223A]">
              Nome completo
            </label>
            <Input
              type="text"
              placeholder="Digite seu nome completo"
              value={nomeCompleto}
              onChange={(e) => {
                setNomeCompleto(e.target.value);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.nomeCompleto;
                  return next;
                });
              }}
              className="bg-white"
              required
            />
            {fieldErrors.nomeCompleto && (
              <p className="text-xs font-medium text-[#E7000B]">
                {fieldErrors.nomeCompleto}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#12223A]">CPF</label>
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
              className="bg-white"
              required
            />
            {fieldErrors.cpf && (
              <p className="text-xs font-medium text-[#E7000B]">
                {fieldErrors.cpf}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#12223A]">CRM</label>
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
              className="bg-white"
              required
            />
            {fieldErrors.crm && (
              <p className="text-xs font-medium text-[#E7000B]">
                {fieldErrors.crm}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#12223A]">
              Data de nascimento
            </label>
            <Input
              type="date"
              value={dtNascimento}
              onChange={(e) => setDtNascimento(e.target.value)}
              className="bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12223A]">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.senha;
                      return next;
                    });
                  }}
                  placeholder="Digite sua senha"
                  className="bg-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.senha && (
                <p className="text-xs font-medium text-[#E7000B]">
                  {fieldErrors.senha}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12223A]">
                Confirmar senha
              </label>
              <div className="relative">
                <Input
                  type={mostrarConfirmacao ? 'text' : 'password'}
                  value={confirmacaoSenha}
                  onChange={(e) => {
                    setConfirmacaoSenha(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.confirmacaoSenha;
                      delete next.senha;
                      return next;
                    });
                  }}
                  placeholder="Repita sua senha"
                  className="bg-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarConfirmacao ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmacaoSenha && (
                <p className="text-xs font-medium text-[#E7000B]">
                  {fieldErrors.confirmacaoSenha}
                </p>
              )}
            </div>
          </div>

          {passwordMismatch &&
            !fieldErrors.senha &&
            !fieldErrors.confirmacaoSenha && (
              <p className="text-xs font-medium text-[#E7000B]">
                As senhas não coincidem.
              </p>
            )}

          {error && <p className="text-xs font-bold text-[#E7000B]">{error}</p>}

          <Button
            type="submit"
            disabled={useCreateUser().isPending}
            className="h-11 w-full gap-2 bg-[#1A63AB] font-semibold text-white transition-all hover:bg-[#1A63AB]/90"
          >
            {useCreateUser().isPending ? 'Enviando...' : 'Finalizar inscrição'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ModalNovaInscricao;
