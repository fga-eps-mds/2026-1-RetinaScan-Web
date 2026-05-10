import { useState, useEffect } from 'react';
import { CardHistorico } from '../components/CardHistorico';
import { MOCK_HISTORICO } from '../mocks/relatorioMock';
import type { ExameHistory } from '../types/exam-history';

const HistoricoExame = () => {
  const [exames, setExames] = useState<ExameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const carregarExames = async () => {
      setLoading(true);
      setError(false);
      try {
        // Quando a API estiver pronta, basta substituir MOCK_HISTORICO pelo fetch/axios
        setExames(MOCK_HISTORICO); 
      } catch (err) {
        console.error('Erro ao buscar exames:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    carregarExames();
  }, []);

  return (
    <div className="w-full flex justify-center flex-col gap-2 p-8">
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