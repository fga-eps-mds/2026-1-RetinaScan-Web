import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardResultado } from '@/features/historico-exames/components/CardResultado';

describe('CardResultado', () => {
  it('exibe o estado pendente por padrão quando não há payload', () => {
    render(<CardResultado />);

    expect(screen.getByText('Análise da Inteligência Artificial')).toBeInTheDocument();
    
    // Usamos queryAllByText para pegar as ocorrências (pode ser 1 ou 2 dependendo do statusMapper)
    const titles = screen.queryAllByText('Análise pendente');
    expect(titles.length).toBeGreaterThan(0); 

    expect(
      screen.getByText('O exame foi criado, mas ainda não iniciou o processamento pela inteligência artificial.')
    ).toBeInTheDocument();
  });

  it('exibe o estado de processamento corretamente', () => {
    const mockPayload = {
      exam: { status: 'EM_PROCESSAMENTO' as const }
    };

    render(<CardResultado payload={mockPayload as any} />);

    const titles = screen.queryAllByText('Análise em processamento');
    expect(titles.length).toBeGreaterThan(0);

    expect(
      screen.getByText('A inteligência artificial está processando este exame. Aguarde a conclusão.')
    ).toBeInTheDocument();
  });

  it('exibe o estado de erro corretamente', () => {
    const mockPayload = {
      exam: { status: 'ERRO_PROCESSAMENTO' as const }
    };

    render(<CardResultado payload={mockPayload as any} />);

    const titles = screen.queryAllByText('Erro no processamento');
    expect(titles.length).toBeGreaterThan(0);

    expect(
      screen.getByText('Ocorreu uma falha durante o processamento da análise automatizada.')
    ).toBeInTheDocument();
  });

  it('exibe os resultados da IA quando o exame está concluído', () => {
    const mockPayload = {
      exam: { status: 'CONCLUIDO' as const },
      resultadosIa: [
        {
          id: '1',
          lateralidadeOlho: 'OD',
          predictedClass: 0,
          predictedLabel: 'normal',
          confidence: 0.985
        },
        {
          id: '2',
          lateralidadeOlho: 'OE',
          predictedClass: 1,
          predictedLabel: 'alterado',
          confidence: 0.752
        }
      ]
    };

    render(<CardResultado payload={mockPayload as any} />);

    // Verifica se os olhos foram renderizados
    expect(screen.getByText('Olho direito (OD)')).toBeInTheDocument();
    expect(screen.getByText('Olho esquerdo (OE)')).toBeInTheDocument();

    // Verifica as labels convertidas
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Alterado')).toBeInTheDocument();

    // Verifica se a confiança foi calculada e formatada corretamente (* 100 e toFixed(1))
    expect(screen.getByText('98.5%')).toBeInTheDocument();
    expect(screen.getByText('75.2%')).toBeInTheDocument();
  });
});