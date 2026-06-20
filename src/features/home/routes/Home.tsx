import { useState } from 'react';
import { MetricsSection } from '../components/MetricSection';
import { DashboardFilters } from '../components/DashboardFilters';
import { ExamRow } from '../components/ExamRow';
import type { DashboardResult } from '../types/dashboard-result';

export const Home = () => {
  const [dashboardData] = useState<DashboardResult>({
    metrics: {
      analisesTotais: { total: 4, periodoDias: 30 },
      indicacaoEspecialista: { total: 2, porcentagem: 67 },
      resultadosNormais: { total: 1, porcentagem: 33 },
      pendentes: { total: 4 },
    },
    recentExams: [
      { id: 'EX-2026-0036', pacienteID: 'PAC-1187', olho: 'AO', scoreIA: '91', statusTag: 'PRIORIDADE', dataExame: '18/04/2026' },
      { id: 'EX-2026-0033', pacienteID: 'PAC-0987', olho: 'OD', scoreIA: '87', statusTag: 'PRIORIDADE', dataExame: '05/03/2026' },
      { id: 'EX-2026-0035', pacienteID: 'PAC-2200', olho: 'OE', scoreIA: '39', statusTag: 'NORMAL', dataExame: '11/04/2026' },
      { id: 'EX-2026-0034', pacienteID: 'PAC-8829', olho: 'AO', scoreIA: null, statusTag: 'PENDENTE', dataExame: '09/04/2026' },
    ],
  });

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');

  return (
    <div className="min-h-screen w-full p-12">
      <header className="text-center">
        <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
          Dashboard
        </h2>
        <p className="text-md text-muted-foreground">
          Visão geral da triagem de retinografia
        </p>
      </header>

      <div className="mt-8 pt-8 border-t border-border">
        {/* Seção de Métricas */}
        <MetricsSection metrics={dashboardData.metrics} />

        {/* Seção de Filtros */}
        <DashboardFilters
          searchTerm={search}
          onSearchChange={setSearch}
          priorityFilter={priority}
          onPriorityFilterChange={setPriority}
        />
      <div className="px-8">
        {/* Tabela de Exames Recentes */}
        <ExamRow exams={dashboardData.recentExams} />
      </div>

      </div>

      <footer className="mt-8 text-center text-xs text-gray-400">
        Todos os dados são anonimizados conforme a LGPD
      </footer>
    </div>
  );
};
export default Home;