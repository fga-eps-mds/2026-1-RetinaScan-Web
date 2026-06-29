import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { MetricsSection } from '../MetricSection';
import { TimeSeriesChart } from '../TimeSeriesChart';
import { DashboardDateFilters } from '../DashboardDateFilters';
import { useGetMetrics } from '../../hooks/useGetMetrics';
import { mapDashboardMetrics } from '../../../../utils/mappers/mapDashboardMetrics';

import { authClient } from '@/lib/auth-client';
import { DashboardHeader } from '../DashboardHeader';

// Contrato de tipagem para desserialização segura de erros provenientes da API.
interface BackendErrorResponse {
  response?: {
    data?: {
      message?: string;
      fields?: Array<{ message: string }>;
    };
  };
}

export const AdminDashboard = () => {
  const { data: session } = authClient.useSession();
  
  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'Administrador';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Memoização do payload de filtros para garantir estabilidade referencial.
  const filters = useMemo(() => {
    const currentFilters: { startDate?: string; endDate?: string } = {};
    if (startDate) currentFilters.startDate = startDate;
    if (endDate) currentFilters.endDate = endDate;
    return currentFilters;
  }, [startDate, endDate]);

  const { data: apiMetrics, isLoading, isFetching, isError, error } = useGetMetrics(filters);

  const showLoading = isLoading || isFetching;

  // Desacoplamento: isola a transformação de dados
  const mappedMetrics = useMemo(() => mapDashboardMetrics(apiMetrics), [apiMetrics]);

  // Efeito colateral imperativo para gerenciar notificações na UI.
  useEffect(() => {
    if (isError && error) {
      const backendError = error as unknown as BackendErrorResponse;
      const errorData = backendError?.response?.data;
      
      let errorMessage = 'Erro ao aplicar o filtro de datas.';

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
    // 1. Alterado de h-full para min-h-full e removido o overflow-hidden
    <div className="flex flex-col min-h-full w-full p-6 sm:p-8 lg:p-12">
      
      <div className="shrink-0">
        <DashboardHeader 
          userName={userName}
          badgeText="Dashboard do Administrador"
          subtitle="Visão geral da triagem de retinografia e performance do sistema."
        />
      </div>

      <div className="mt-8 pt-8 border-t border-border flex flex-col flex-1">
        
        <div className="shrink-0">
          {showLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in duration-300">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="font-medium text-lg">Carregando métricas...</p>
            </div>
          ) : isError && !apiMetrics ? (
            <div className="flex justify-center py-12 text-destructive font-medium">Erro crítico ao carregar os dados.</div>
          ) : (
            <MetricsSection metrics={mappedMetrics} />
          )}
        </div>

        <div className="px-4 sm:px-8 mt-6 mb-4 flex justify-end shrink-0">
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

        {/* 2. O GRANDE TRUQUE: min-h-[400px]. Se a tela for pequena, o gráfico exige 400px e aciona o scroll do AppLayout. Se for grande, o flex-1 faz ele crescer. */}
        <div className="px-4 sm:px-8 pb-4 flex-1 min-h-100">
          {!isError && !showLoading && (
            <TimeSeriesChart data={apiMetrics?.volume.serieTemporal || []} />
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;