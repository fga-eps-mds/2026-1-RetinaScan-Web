import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { MetricsSection } from '../MetricSection';
import { TimeSeriesChart } from '../TimeSeriesChart'; 
import { DashboardDateFilters } from '../DashboardDateFilters';
import { DashboardHeader } from '../DashboardHeader';

import { useGetMetrics } from '../../hooks/useGetMetrics';
import { mapDashboardMetrics } from '../../../../utils/mappers/mapDashboardMetrics';
import { authClient } from '@/lib/auth-client';

// Contrato de tipagem para desserialização segura de erros provenientes da API.
interface BackendErrorResponse {
  response?: {
    data?: {
      message?: string;
      fields?: Array<{ message: string }>;
    };
  };
}

export const EspecialistaDashboard = () => {
  const { data: session } = authClient.useSession();
  
  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'Especialista';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Memoização do payload de filtros para garantir estabilidade referencial.
  // Previne gatilhos de re-fetch desnecessários no hook useGetMetrics (React Query).
  const filters = useMemo(() => {
    const currentFilters: { startDate?: string; endDate?: string } = {};
    if (startDate) currentFilters.startDate = startDate;
    if (endDate) currentFilters.endDate = endDate;
    return currentFilters;
  }, [startDate, endDate]);

  const { data: apiMetrics, isLoading, isFetching, isError, error } = useGetMetrics(filters);

  const showLoading = isLoading || isFetching;

  // Desacoplamento: isola a transformação de dados (DTO -> View Model) do ciclo de renderização.
  // Só reprocessa a estrutura se o payload bruto da API mudar.
  const mappedMetrics = useMemo(() => mapDashboardMetrics(apiMetrics), [apiMetrics]);

  // Efeito colateral imperativo para gerenciar notificações na UI.
  // Observa mudanças no estado de erro da requisição para injetar feedback no sistema de Toasts.
  useEffect(() => {
    if (isError && error) {
      const backendError = error as unknown as BackendErrorResponse;
      const errorData = backendError?.response?.data;
      
      let errorMessage = 'Erro ao carregar as métricas.';

      // Fallback em cascata: prioriza erros específicos de campos (validação) antes de erros globais.
      if (errorData?.fields && errorData.fields.length > 0) {
        errorMessage = errorData.fields[0].message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      toast.error(errorMessage);
    }
  }, [isError, error]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen w-full p-12">
      
      <DashboardHeader 
        userName={userName}
        badgeText="Dashboard do Especialista"
        subtitle="Visão geral de exames que necessitam do seu laudo."
      />

      <div className="mt-8 pt-8 border-t border-border">
        
        {/* Renderização declarativa baseada em estados da requisição (Loading -> Error -> Success) */}
        {showLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in duration-300">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="font-medium text-lg">Carregando exames pendentes...</p>
          </div>
        ) : isError && !apiMetrics ? (
          <div className="flex justify-center py-12 text-destructive font-medium">Erro ao carregar os dados.</div>
        ) : (
          <MetricsSection metrics={mappedMetrics} />
        )}

        <div className="px-8 mt-8 mb-4 flex justify-end">
          <DashboardDateFilters 
            startDate={startDate}
            endDate={endDate}
            onApply={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            onClear={handleClearFilters}
          />
        </div>

        <div className="px-8 pb-8">
          {/* Gráfico só é montado no DOM se não houver erros ou loading em andamento */}
          {!isError && !showLoading && (
            <TimeSeriesChart data={apiMetrics?.volume.serieTemporal || []} />
          )}
        </div>

      </div>
    </div>
  );
};

export default EspecialistaDashboard;