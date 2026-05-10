import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import type { ExameHistory } from '../types/exam-history'

export function useFiltroExames(dadosIniciais: ExameHistory[]) {
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [busca, setBusca] = useState("");

    // Criamos o valor "atrasado" (300ms)
  const buscaDebounced = useDebounce(busca, 300);

  const dadosFiltrados = useMemo(() => {
    return dadosIniciais.filter((exame) => {
      // Ajustado para scoreIA e tipagem correta
      const batePrioridade =
        filtroPrioridade === "" || 
        exame.status.toLowerCase().includes(filtroPrioridade.toLowerCase());


      // IMPORTANTE: Use o buscaDebounced para o filtro
      const bateBusca =
        buscaDebounced === "" ||
        exame.id.toLowerCase().includes(buscaDebounced.toLowerCase()) ||
        exame.paciente.toLowerCase().includes(buscaDebounced.toLowerCase());

      return batePrioridade && bateBusca;
    });
  }, [dadosIniciais, filtroPrioridade, buscaDebounced]);

  return {
    filtroPrioridade,
    setFiltroPrioridade,
    busca,
    setBusca,
    dadosFiltrados,
  };
}