import { useState, useMemo } from 'react';
import { MetricsSection } from '../components/MetricSection';
import { DashboardFilters } from '../components/DashboardFilters';
import { ExamRow } from '../components/ExamRow';
import type { DashboardMetrics, RecentExamItem } from '../types/dashboard-result';
import { useGetMetrics } from '../hooks/useGetMetrics'; // <-- Importe o hook

export const Home = () => {
  // Chamada à API
  const { data: apiMetrics, isLoading, isError } = useGetMetrics();

  // Estados dos filtros da Tabela
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');

  // Transformando os dados do backend para o formato que a sua UI espera
  const mappedMetrics: DashboardMetrics = useMemo(() => {
    if (!apiMetrics) {
      return {
        analisesTotais: { total: 0, periodoDias: 30 },
        indicacaoEspecialista: { total: 0, porcentagem: 0 },
        resultadosNormais: { total: 0, porcentagem: 0 },
        pendentes: { total: 0 },
      };
    }

    // Helper para buscar total de um diagnóstico específico
    const getDiagnostico = (label: string) => 
      apiMetrics.resultadosIa.porDiagnostico.find(d => d.label === label)?.total || 0;

    const totalIa = apiMetrics.resultadosIa.totalResultados || 1; // Evita divisão por zero
    const normais = getDiagnostico('normal');
    const anormais = getDiagnostico('abnormal');

    // Pendentes = CRIADO + EM_PROCESSAMENTO
    const totalPendentes = 
      (apiMetrics.volume.porStatus.CRIADO || 0) + 
      (apiMetrics.volume.porStatus.EM_PROCESSAMENTO || 0);

    return {
      analisesTotais: { 
        total: apiMetrics.volume.total, 
        periodoDias: 30 // Isso pode virar dinâmico se adicionarem filtro de data
      },
      indicacaoEspecialista: { 
        total: anormais, 
        porcentagem: Math.round((anormais / totalIa) * 100)
      },
      resultadosNormais: { 
        total: normais, 
        porcentagem: Math.round((normais / totalIa) * 100) 
      },
      pendentes: { 
        total: totalPendentes 
      },
    };
  }, [apiMetrics]);

  // Mantendo o mock da tabela até a rota de listagem ser integrada
  const [recentExams] = useState<RecentExamItem[]>([
    { id: 'EX-2026-0036', pacienteID: 'PAC-1187', olho: 'AO', scoreIA: '91', statusTag: 'PRIORIDADE', dataExame: '18/04/2026' },
    { id: 'EX-2026-0033', pacienteID: 'PAC-0987', olho: 'OD', scoreIA: '87', statusTag: 'PRIORIDADE', dataExame: '05/03/2026' },
    { id: 'EX-2026-0035', pacienteID: 'PAC-2200', olho: 'OE', scoreIA: '39', statusTag: 'NORMAL', dataExame: '11/04/2026' },
    { id: 'EX-2026-0034', pacienteID: 'PAC-8829', olho: 'AO', scoreIA: null, statusTag: 'PENDENTE', dataExame: '09/04/2026' },
  ]);

  return (
    <div className="min-h-screen w-full p-12">
      <header className="text-center">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Dashboard
        </h2>
        <p className="text-md text-muted-foreground">
          Visão geral da triagem de retinografia
        </p>
      </header>

      <div className="mt-8 pt-8 border-t border-border">
        
        {/* Renderização condicional para as Métricas */}
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-500">Carregando métricas...</div>
        ) : isError ? (
          <div className="flex justify-center p-8 text-red-500 font-medium">Erro ao carregar os dados.</div>
        ) : (
          <MetricsSection metrics={mappedMetrics} />
        )}

        {/* Seção de Filtros */}
        <DashboardFilters
          searchTerm={search}
          onSearchChange={setSearch}
          priorityFilter={priority}
          onPriorityFilterChange={setPriority}
        />

        <div className="px-8">
          {/* Tabela de Exames Recentes */}
          <ExamRow exams={recentExams} />
        </div>

      </div>

      <footer className="mt-8 text-center text-xs text-gray-400">
        Todos os dados são anonimizados conforme a LGPD
      </footer>
    </div>
  );
};

export default Home;