import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

import { DashboardDateFilters } from '@/features/home/components/DashboardDateFilters';
import { formatDateInput } from '@/utils/date';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@/utils/date', () => ({
  formatDateInput: vi.fn(),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect: (date: Date) => void }) => (
    <div>
      <button 
        data-testid="mock-calendar-btn" 
        onClick={() => onSelect(new Date('2026-06-15T00:00:00'))}
      >
        Selecionar Dia 15
      </button>
      <button 
        data-testid="mock-calendar-btn-invalid" 
        onClick={() => onSelect(new Date('2026-05-01T00:00:00'))}
      >
        Selecionar Dia Anterior
      </button>
    </div>
  ),
}));

describe('DashboardDateFilters', () => {
  const mockOnApply = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(formatDateInput).mockImplementation((dateValue?: string | Date | null) => {
      if (!dateValue) return '';
      const date = new Date(dateValue);
      return date.toISOString().split('T')[0];
    });
  });

  it('deve renderizar as datas iniciais e manter o botão Aplicar desabilitado se não houver mudanças', () => {
    render(
      <DashboardDateFilters
        startDate="2026-06-01"
        endDate="2026-06-30"
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('01/06/2026')).toBeInTheDocument();
    expect(screen.getByText('30/06/2026')).toBeInTheDocument();
    
    const applyButton = screen.getByText('Aplicar');
    expect(applyButton).toBeDisabled();
  });

  it('deve habilitar o botão Aplicar ao alterar a data e chamar onApply com os valores corretos', () => {
    render(
      <DashboardDateFilters
        startDate="2026-06-01"
        endDate="2026-06-30"
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const calendarButtons = screen.getAllByTestId('mock-calendar-btn');
    fireEvent.click(calendarButtons[1]); 

    const applyButton = screen.getByText('Aplicar');
    expect(applyButton).not.toBeDisabled();

    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith('2026-06-01', '2026-06-15');
  });

  it('deve disparar um toast de erro se a data inicial for maior que a data final', () => {
    render(
      <DashboardDateFilters
        startDate="2026-06-01"
        endDate="2026-06-30"
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const invalidCalendarButtons = screen.getAllByTestId('mock-calendar-btn-invalid');
    fireEvent.click(invalidCalendarButtons[1]); 

    const applyButton = screen.getByText('Aplicar');
    fireEvent.click(applyButton);

    expect(mockOnApply).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('A data de início deve vir antes da data final.');
  });

  it('deve limpar os filtros e chamar onClear ao clicar no botão Limpar', () => {
    render(
      <DashboardDateFilters
        startDate="2026-06-01"
        endDate="2026-06-30"
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText('Limpar');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
    
    expect(screen.queryByText('01/06/2026')).not.toBeInTheDocument();
    expect(screen.queryByText('30/06/2026')).not.toBeInTheDocument();
    expect(screen.getAllByText('Selecionar')).toHaveLength(2);
  });
});