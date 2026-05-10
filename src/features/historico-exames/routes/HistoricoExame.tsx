import { useState, useEffect } from 'react';
import { CardHistorico } from '../components/CardHistorico';
import type { ExameHistory } from '../types/exam-history';
import { toast } from 'sonner';
import { fetchExames } from '../service/examesApi';
import { useSession } from '@/lib/auth-client';

const HistoricoExame = () => {
  const [exames, setExames] = useState<ExameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { data: session } = useSession();

  function getTokenFromSession(sess: unknown): string {
    if (!sess || typeof sess !== 'object') return '';
    const s = sess as Record<string, unknown>;

    if (typeof s.accessToken === 'string') return s.accessToken;
    if (typeof s.token === 'string') return s.token;
    if (typeof s.idToken === 'string') return s.idToken;

    if (s.user && typeof s.user === 'object') {
      const user = s.user as Record<string, unknown>;
      if (typeof user.token === 'string') return user.token;
    }

    if (s.session && typeof s.session === 'object') {
      const ss = s.session as Record<string, unknown>;
      if (typeof ss.token === 'string') return ss.token;
    }

    return '';
  }

  const token = getTokenFromSession(session);

  useEffect(() => {
    let isMounted = true;

    const carregarExames = async () => {
      setLoading(true);
      setError(false);

      try {
        const remote = await fetchExames(token);

        setExames(remote);
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(true);

        const status =
          err && typeof err === 'object' && 'status' in err
            ? (err as { status: number }).status
            : null;

        const isAuthError = status === 401;

        toast.error(isAuthError ? 'Sessão expirada' : 'Erro de conexão', {
          id: 'historico-fetch-error',
          description: isAuthError
            ? 'Seu token expirou. Por favor, realize o login novamente.'
            : 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
          icon: null,
          action: isAuthError
            ? {
                label: 'Login',
                onClick: () => (window.location.href = '/login'),
              }
            : undefined,
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregarExames();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="w-full flex justify-center flex-col gap-2 p-8 animate-in fade-in duration-500">
      <header className="text-center">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Exames
        </h2>
        <p className="text-md text-muted-foreground">
          Histórico completo de retinografias
        </p>
      </header>

      <div className="mt-8 pt-8 border-t border-border">
        <CardHistorico dados={exames} isLoading={loading} isError={error} />
      </div>
    </div>
  );
};

export default HistoricoExame;
