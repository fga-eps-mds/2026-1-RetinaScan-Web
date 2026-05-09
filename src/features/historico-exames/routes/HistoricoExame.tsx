import { useState, useEffect } from 'react';
import { CardHistorico } from '../components/CardHistorico';

// Quando integrar a api, tem que tirar esses dados setados
// por enquanto para mostra a tela coloca na rota historico-exames
const MOCK_DATA = [
  { id: "EX-2026-0036", paciente: "PAC-1187", olho: "AO", score_ia: 91, status: "Prioridade", data: "18/04/2026" },
  { id: "EX-2026-0035", paciente: "PAC-2200", olho: "AO", score_ia: 23, status: "Normal", data: "11/04/2026" },
  { id: "EX-2026-0034", paciente: "PAC-8829", olho: "AO", score_ia: null, status: "Pendente", data: "09/04/2026" },
];

const HistoricoExame = () => {
  const [exames, setExames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarExames = async () => {
      setLoading(true);
      try {
        // SETANDO OS DADOS, QUANDO A API INTEGRAR, TEM QUE TIRAR E COLOCAR O FETCH
        setExames(MOCK_DATA); 
      } catch (error) {
        console.error("Erro ao buscar exames:", error);
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
         Histórico completo de retinografias
        </p>
      </header>
      
      <div className="mt-8 pt-8 border-t border-border">
        {loading ? (
          <p className="text-center py-10 text-muted-foreground font-medium">
            Carregando exames...
          </p>
        ) : (
          <CardHistorico dados={exames} />
        )}
      </div>
    </div>
  );
};

export default HistoricoExame;