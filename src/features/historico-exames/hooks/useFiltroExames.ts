import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import { sanitizeExamSearch, isValidExamIdPattern } from "@/utils/validators";
import type { ExameHistory } from '../types/exam-history';

export function useFiltroExames(dadosIniciais: ExameHistory[]) {
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [busca, setBusca] = useState("");

  // Valida se o texto segue o padrão EX-0000-0000
  const isSearchValid = useMemo(() => isValidExamIdPattern(busca), [busca]);

  // Delay de 300ms para evitar re-filtros excessivos durante a digitação
  const buscaDebounced = useDebounce(busca, 300);

  // Aplica sanitização (remove caracteres especiais) antes de atualizar o estado
  const handleBuscaChange = (valor: string) => {
    const valorLimpo = sanitizeExamSearch(valor);
    setBusca(valorLimpo);
  };

  // Processa a filtragem combinada (Prioridade + Busca)
  const dadosFiltrados = useMemo(() => {
    return dadosIniciais.filter((exame) => {
      const batePrioridade =
        filtroPrioridade === "" || 
        exame.status.toLowerCase().includes(filtroPrioridade.toLowerCase());

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
    setBusca: handleBuscaChange,
    isSearchValid,
    dadosFiltrados,
  };
}