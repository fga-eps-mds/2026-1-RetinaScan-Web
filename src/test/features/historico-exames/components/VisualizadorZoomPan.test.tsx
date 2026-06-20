import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VisualizadorZoomPan } from '@/features/historico-exames/components/VisualizadorZoomPan';

describe('VisualizadorZoomPan', () => {
  const mockImageUrl = 'https://exemplo.com/retina.jpg';

  it('renderiza o estado inicial corretamente', () => {
    render(<VisualizadorZoomPan imageUrl={mockImageUrl} />);

    // 1. A imagem deve estar na tela com o src correto
    const imagem = screen.getByAltText('Visualização da Retina');
    expect(imagem).toBeInTheDocument();
    expect(imagem).toHaveAttribute('src', mockImageUrl);

    // 2. Os textos do HUD devem estar presentes
    expect(screen.getByText('Scroll:')).toBeInTheDocument();
    expect(screen.getByText('Arrastar:')).toBeInTheDocument();

    // 3. O botão de Resetar NÃO deve estar na tela no estado inicial (escala 1, pos 0)
    expect(screen.queryByText('Resetar')).not.toBeInTheDocument();
  });

  it('exibe o botão de resetar ao simular o Pan (arrastar) e restaura ao clicar', () => {
    render(<VisualizadorZoomPan imageUrl={mockImageUrl} />);

    // Capturamos o container principal que recebe os eventos de mouse
    // Pegamos a div pai através de um dos textos do HUD para facilitar
    const hudText = screen.getByText('Scroll:');
    const container = hudText.closest('div')?.parentElement as HTMLElement;

    // Simula o clique do mouse e o arraste
    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(container, { clientX: 150, clientY: 150 });
    
    // Agora que a posição mudou, o botão deve aparecer
    const btnReset = screen.getByText('Resetar');
    expect(btnReset).toBeInTheDocument();

    // Simula o clique no botão para limpar as transformações
    fireEvent.click(btnReset);

    // O botão deve sumir novamente, indicando que o estado voltou a scale 1 e pos 0
    expect(screen.queryByText('Resetar')).not.toBeInTheDocument();
  });

  it('aplica o zoom e exibe o botão de reset ao usar o scroll (wheel)', () => {
    render(<VisualizadorZoomPan imageUrl={mockImageUrl} />);

    const hudText = screen.getByText('Scroll:');
    const container = hudText.closest('div')?.parentElement as HTMLElement;

    // Simula rolar a bolinha do mouse para cima (deltaY negativo = zoom in)
    fireEvent.wheel(container, { deltaY: -100 });

    // Como a escala mudou (ficou maior que 1), o botão de reset deve surgir
    expect(screen.getByText('Resetar')).toBeInTheDocument();
  });

  it('impede que o evento wheel faça a tela rolar (preventDefault)', () => {
    render(<VisualizadorZoomPan imageUrl={mockImageUrl} />);

    const hudText = screen.getByText('Scroll:');
    const container = hudText.closest('div')?.parentElement as HTMLElement;

    // Criamos um evento Wheel customizado para podermos espionar o preventDefault
    const wheelEvent = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
    
    // Espionamos a função preventDefault nativa
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');

    // Disparamos o evento no container
    container.dispatchEvent(wheelEvent);

    // Verificamos se o nosso componente mandou o navegador parar de rolar a página
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});