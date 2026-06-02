import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useResetPassword } from '../hooks/usePasswordReset';

type ResetPasswordSearchParams = {
  token: string | null;
};

function getResetPasswordSearchParams(
  searchParams: URLSearchParams
): ResetPasswordSearchParams {
  return {
    token: searchParams.get('token'),
  };
}

function hasValidResetToken(
  params: ResetPasswordSearchParams
): params is { token: string } {
  return typeof params.token === 'string' && params.token.trim().length > 0;
}

const PasswordReset = () => {
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetPasswordMutation = useResetPassword();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const params = useMemo(
    () => getResetPasswordSearchParams(searchParams),
    [searchParams]
  );

  const passwordError = useMemo(() => {
    if (!password) return '';
    if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
    return '';
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return '';
    if (password !== confirmPassword) return 'As senhas não coincidem';
    return '';
  }, [password, confirmPassword]);

  const isInvalidToken = !hasValidResetToken(params);

  const isFormInvalid =
    isInvalidToken ||
    !password ||
    !confirmPassword ||
    !!passwordError ||
    !!confirmPasswordError;

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!hasValidResetToken(params)) {
      setError('Token de redefinição inválido ou ausente.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordMutation.mutateAsync({
        token: params.token,
        newPassword: password,
      });

      setSuccess(true);
      toast.success('Senha redefinida com sucesso.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao redefinir a senha.';

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EFF6FF] px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md rounded-2xl border border-[#1A63AB]/10 bg-white p-6 shadow-sm sm:p-8"
      >
        {!success ? (
          <>
            <div className="mb-6 space-y-2 text-center">
              <h1 className="text-2xl font-heading font-bold text-[#12223A]">
                Redefinir senha
              </h1>
              <p className="text-sm text-muted-foreground">
                Digite sua nova senha para concluir a recuperação de acesso.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#12223A]">
                  Nova senha
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="bg-white pl-9"
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

                {passwordError && (
                  <p className="text-xs font-medium text-[#E7000B]">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#12223A]">
                  Confirmar nova senha
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={mostrarConfirmacao ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="bg-white pl-9"
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

                {confirmPasswordError && (
                  <p className="text-xs font-medium text-[#E7000B]">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-center text-xs font-bold text-[#E7000B]">
                  {error}
                </p>
              )}

              {isInvalidToken && (
                <p className="text-center text-xs font-bold text-[#E7000B]">
                  Link inválido ou expirado.
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || isFormInvalid}
                className="h-11 w-full gap-2 bg-[#1A63AB] font-semibold text-white transition-all hover:bg-[#1A63AB]/90"
              >
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button asChild type="button" variant="ghost" className="w-full">
                <Link to="/login">Voltar para o login</Link>
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1A63AB]/10">
              <CheckCircle2 className="h-7 w-7 text-[#1A63AB]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-heading font-bold text-[#12223A]">
                Senha redefinida
              </h1>
              <p className="text-sm text-muted-foreground">
                Sua senha foi atualizada com sucesso. Agora você já pode entrar
                na plataforma com a nova credencial.
              </p>
            </div>

            <Button
              asChild
              className="h-11 w-full gap-2 bg-[#1A63AB] font-semibold text-white transition-all hover:bg-[#1A63AB]/90"
            >
              <Link to="/login">
                Ir para login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PasswordReset;
