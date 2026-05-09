import { useState, useMemo } from "react";

export function useFiltroExames( dadosIniciais: any[] ) {
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [busca, setBusca] = useState("");

  const dadosFiltrados = useMemo(() => {
    return dadosIniciais.filter((exame) => {
      const Prioridade =
        filtroPrioridade === "" || exame.status.toLowerCase().includes(filtroPrioridade.toLowerCase());
      const Busca =
        busca === "" ||
        exame.id.toLowerCase().includes(busca.toLowerCase()) ||
        exame.paciente.toLowerCase().includes(busca.toLowerCase());
      return Prioridade && Busca;
    });
  }, [dadosIniciais, filtroPrioridade, busca]);

  return {
    filtroPrioridade,
    setFiltroPrioridade,
    busca,
    setBusca,
    dadosFiltrados,
  };
}