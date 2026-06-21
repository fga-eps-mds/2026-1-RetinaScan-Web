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

export const EspecialistaDashboard = () => {
  const { data: session } = authClient.useSession();
  
  // Pegamos o primeiro nome, e deixamos 'Especialista' como fallback
  const userName = session?.user?.name ? session.user.name.split(' ')[0] : 'Especialista';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filters = useMemo(() => {
    const currentFilters: { startDate?: string; endDate?: string } = {};
    if (startDate) currentFilters.startDate = startDate;
    if (endDate) currentFilters.endDate = endDate;
    return currentFilters;
  }, [startDate, endDate]);

  const { data: apiMetrics, isLoading, isFetching, isError, error } = useGetMetrics(filters);

  const showLoading = isLoading || isFetching;

  const mappedMetrics = useMemo(() => mapDashboardMetrics(apiMetrics), [apiMetrics]);

  useEffect(() => {
    if (isError && error) {
      const backendError = error as any;
      const errorData = backendError?.response?.data;
      
      let errorMessage = 'Erro ao carregar as métricas.';

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
      
      {/* Componente Modularizado com textos exclusivos para o Especialista */}
      <DashboardHeader 
        userName={userName}
        badgeText="Dashboard do Especialista"
        subtitle="Visão geral de exames que necessitam do seu laudo."
      />

      <div className="mt-8 pt-8 border-t border-border">
        
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
          {!isError && !showLoading && (
            <TimeSeriesChart data={apiMetrics?.volume.serieTemporal || []} />
          )}
        </div>

      </div>
    </div>
  );
};

export default EspecialistaDashboard;