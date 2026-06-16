// CardLaudoVisualizacao.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardLaudoVisualizacao } from '@/features/historico-exames/components/CardLaudoVisualizacao';

describe('CardLaudoVisualizacao', () => {
  it('deve renderizar a badge verde e texto correto quando resultadoIaValido for true', () => {
    render(
      <CardLaudoVisualizacao
        especialistaNome="Dr. House"
        resultadoIaValido={true}
        html="<p>Pulmão limpo</p>"
      />
    );

    expect(screen.getByText('Registrado por Dr. House')).toBeInTheDocument();
    const badge = screen.getByText('IA avaliada como correta');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-emerald-900');
    expect(screen.getByText('Pulmão limpo')).toBeInTheDocument();
  });

  it('deve renderizar badge vermelha quando resultadoIaValido for false', () => {
    render(
      <CardLaudoVisualizacao
        resultadoIaValido={false}
        texto="Diagnóstico incorreto da máquina."
      />
    );

    const badge = screen.getByText('IA avaliada como incorreta');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-rose-900');
  });

  it('deve exibir mensagem padrão se nenhum laudo for passado', () => {
    render(<CardLaudoVisualizacao resultadoIaValido={null} html={null} texto={null} />);
    expect(screen.getByText('Laudo não disponível.')).toBeInTheDocument();
  });
});