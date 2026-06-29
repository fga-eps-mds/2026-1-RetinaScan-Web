import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimeSeriesChart } from '@/features/home/components/TimeSeriesChart';

// Mockamos o ResponsiveContainer para evitar erros de cálculo de dimensão no JSDOM
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container">{children}</div>
    ),
  };
});

describe('TimeSeriesChart', () => {
  it('deve exibir o estado vazio (Empty State) se o array de dados for vazio', () => {
    // Act
    render(<TimeSeriesChart data={[]} />);

    // Assert
    expect(screen.getByText('Nenhum dado encontrado para o período selecionado.')).toBeInTheDocument();
    expect(screen.getByText('Tente selecionar um intervalo de datas diferente.')).toBeInTheDocument();
    
    // Garante que a estrutura do gráfico não foi renderizada
    expect(screen.queryByText('Volume de Exames por Dia')).not.toBeInTheDocument();
  });

  it('deve exibir o estado vazio (Empty State) se os dados não forem fornecidos (undefined)', () => {
    // Act: Forçamos o envio de undefined burlando a tipagem para simular falha em runtime
    render(<TimeSeriesChart data={undefined as any} />);

    // Assert
    expect(screen.getByText('Nenhum dado encontrado para o período selecionado.')).toBeInTheDocument();
  });

  it('deve renderizar o título do gráfico e o container do Recharts quando houver dados', () => {
    // Arrange
    const mockData = [
      { data: '01/06/2026', total: 10 },
      { data: '02/06/2026', total: 15 },
    ];

    // Act
    render(<TimeSeriesChart data={mockData} />);

    // Assert: O empty state não pode existir aqui
    expect(screen.queryByText('Nenhum dado encontrado para o período selecionado.')).not.toBeInTheDocument();

    // Assert: Título e Gráfico devem estar na tela
    expect(screen.getByText('Volume de Exames por Dia')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
  });
});