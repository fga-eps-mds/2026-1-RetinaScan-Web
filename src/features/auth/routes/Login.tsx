import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: '/',
      });

      if (error) {
        setError(error.message || 'Falha ao entrar');
        toast.error(error.message || 'Falha ao entrar');
        return;
      }
    } catch {
      setError('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#EFF6FF]">
      <div className="hidden lg:flex lg:w-1/2 gradient-clinical relative overflow-hidden items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center space-y-6 max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white">
            RetinaScan
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Plataforma inteligente para triagem e gestão de exames de
            retinografia. Automatize a análise, priorize casos críticos e apoie
            a decisão médica.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-clinical flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-[#12223A]">
              RetinaScan
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold text-[#12223A]">
              Entrar na plataforma
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Insira suas credenciais para acessar o sistema
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12223A]">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12223A]">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Digite sua senha"
                  className="pl-9 bg-white"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(!!c)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs font-medium text-muted-foreground cursor-pointer"
                  >
                    Lembrar de mim
                  </label>
                </div>
                <button
                  type="button"
                  className="text-xs text-[#1A63AB] font-semibold hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A63AB] hover:bg-[#1A63AB]/90 text-white font-semibold h-11 gap-2 cursor-pointer transition-all"
            >
              {loading ? 'Entrando...' : 'Entrar'}{' '}
              <ArrowRight className="w-4 h-4" />
            </Button>

            {error && (
              <p className="text-xs text-[#E7000B] font-bold text-center">
                {error}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
