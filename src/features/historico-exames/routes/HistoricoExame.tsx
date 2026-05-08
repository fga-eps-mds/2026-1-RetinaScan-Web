import { useState, useEffect } from 'react';
import { CardHistorico } from '../components/CardHistorico';

const HistoricoExame = () => {
  const [exames, setExames] = useState([]);
  const [loading, setLoading] = useState(true);

  // tem que mudar isso aqui
  useEffect(() => {
    const carregarExames = async () => {
      try {

        const dados = await Response.json();
        setExames(dados);
      } catch (error) {
        console.error("Erro ao buscar exames:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarExames();
  }, []);

  return (
    <div className="w-full p-8">
      <header className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-900 sm:text-2xl">Exames</h2>
        <p className="text-md text-slate-500">Histórico completo de retinografias</p>
      </header>
      
      <div className="flex items-center justify-center gap-16 border-t border-border mt-8 pt-8">
        
        {loading ? (
          <p className="text-center">Carregando exames...</p>
        ) : (
          <CardHistorico dados={exames} />
        )}
      </div>
    </div>
  );
};

export default HistoricoExame;