import { useState, useEffect } from 'react';
import { CardHistorico } from '../components/CardHistorico';
import { MOCK_HISTORICO } from '../mocks/relatorioMock';
import type { ExameHistory } from '../types/exam-history';
import { toast } from 'sonner';

/**
 * Página de Histórico de Exames
 * Gerencia o ciclo de vida dos dados, estados de carregamento e notificações.
 */
const HistoricoExame = () => {
  const [exames, setExames] = useState<ExameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const carregarExames = async () => {
      setLoading(true);
      setError(false);

      try {
        /** * INTEGRATION_POINT:
         * Substitua o MOCK_HISTORICO pela chamada real da sua API ou Service.
         */
        setExames(MOCK_HISTORICO); 
        
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(true);

        // Tratamento seguro do erro para evitar o uso de 'any'
        const status = err && typeof err === 'object' && 'status' in err 
          ? (err as { status: number }).status 
          : null;

        const isAuthError = status === 401;

        // Feedback visual amigável via Toast
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
  }, []);

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
        <CardHistorico 
          dados={exames} 
          isLoading={loading} 
          isError={error} 
        />
      </div>
    </div>
  );
};

export default HistoricoExame;