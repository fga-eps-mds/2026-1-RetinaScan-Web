import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Eye, Mail, Lock, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const Login = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-clinical relative overflow-hidden items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center space-y-6 max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center mx-auto">
            <Eye className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-primary-foreground">
            RetinaScan
          </h1>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">
            Plataforma inteligente para triagem e gestão de exames de
            retinografia. Automatize a análise, priorize casos críticos e apoie
            a decisão médica.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-clinical flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              RetinaScan
            </span>
          </div>

          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">
              Entrar na plataforma
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Insira suas credenciais para acessar o sistema
            </p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Digite sua senha"
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-clinical border-0 text-primary-foreground hover:opacity-90 gap-2"
            >
              Entrar <ArrowRight />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Sistema protegido conforme LGPD. Dados anonimizados.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
