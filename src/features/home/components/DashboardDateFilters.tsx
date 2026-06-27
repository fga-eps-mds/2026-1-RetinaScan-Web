import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDateInput } from '@/utils/date';

interface DashboardDateFiltersProps {
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
  onClear: () => void;
}

export const DashboardDateFilters: React.FC<DashboardDateFiltersProps> = ({
  startDate,
  endDate,
  onApply,
  onClear,
}) => {
  // Estado local para manipulação temporária das datas antes da submissão.
  const [localStart, setLocalStart] = useState<Date | undefined>(
    startDate ? new Date(`${startDate}T00:00:00`) : undefined
  );
  const [localEnd, setLocalEnd] = useState<Date | undefined>(
    endDate ? new Date(`${endDate}T00:00:00`) : undefined
  );

  // Derivação de estado no render (Render Phase State Derivation):
  // Sincroniza props externas com o estado local sem usar useEffect.
  // Isso previne renderizações em cascata e melhora a performance da árvore React.
  const [prevStartDate, setPrevStartDate] = useState(startDate);
  const [prevEndDate, setPrevEndDate] = useState(endDate);

  if (startDate !== prevStartDate) {
    setPrevStartDate(startDate);
    setLocalStart(startDate ? new Date(`${startDate}T00:00:00`) : undefined);
  }

  if (endDate !== prevEndDate) {
    setPrevEndDate(endDate);
    setLocalEnd(endDate ? new Date(`${endDate}T00:00:00`) : undefined);
  }

  const handleApply = () => {
    const startStr = localStart ? formatDateInput(localStart) : '';
    const endStr = localEnd ? formatDateInput(localEnd) : '';

    // Validação de integridade do intervalo (range) e formatação antes de notificar o componente pai.
    if (localStart && !startStr) {
      toast.error('Verifique a data inicial. O ano deve estar entre 1900 e 2100.');
      return;
    }

    if (localEnd && !endStr) {
      toast.error('Verifique a data final. O ano deve estar entre 1900 e 2100.');
      return;
    }

    if (startStr && endStr && startStr > endStr) {
      toast.error('A data de início deve vir antes da data final.');
      return;
    }

    onApply(startStr, endStr);
  };

  const handleClear = () => {
    setLocalStart(undefined);
    setLocalEnd(undefined);
    onClear();
  };

  // Computação de flags para controle condicional da UI (botões de ação).
  const currentStartStr = startDate || '';
  const currentEndStr = endDate || '';
  const selectedStartStr = localStart ? formatDateInput(localStart) : '';
  const selectedEndStr = localEnd ? formatDateInput(localEnd) : '';
  
  // Avalia se o estado local temporário difere do estado consolidado nas props.
  const hasPendingChanges = selectedStartStr !== currentStartStr || selectedEndStr !== currentEndStr;
  const hasActiveFilter = Boolean(startDate || endDate);

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">De:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-37.5 justify-start text-left font-normal border-gray-200 text-sm py-1.5 h-9",
                !localStart && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localStart ? format(localStart, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecionar</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={localStart} onSelect={setLocalStart} locale={ptBR} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Até:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-37.5 justify-start text-left font-normal border-gray-200 text-sm py-1.5 h-9",
                !localEnd && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localEnd ? format(localEnd, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecionar</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={localEnd} onSelect={setLocalEnd} locale={ptBR} />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        onClick={handleApply}
        disabled={!hasPendingChanges}
        className={cn(
          'text-sm font-medium h-9 px-4 transition-colors',
          hasPendingChanges
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
        )}
      >
        Aplicar
      </Button>

      {(hasActiveFilter || localStart || localEnd) && (
        <button
          onClick={handleClear}
          className="text-sm font-medium text-red-500 hover:text-red-700 px-2 transition-colors"
        >
          Limpar
        </button>
      )}
    </div>
  );
};