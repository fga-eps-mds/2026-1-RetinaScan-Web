import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { CardLaudo } from '../../../../features/historico-exames/components/CardLaudo';

describe('CardLaudo', () => {
  it('renders action buttons', () => {
    render(<CardLaudo />);

    expect(screen.getByText('Correto')).toBeDefined();
    expect(screen.getByText('Incorreto')).toBeDefined();
  });

  it('renders editor container in create mode', () => {
    const { container } = render(<CardLaudo />);

    // Verifica que o container do editor foi montado
    const editorEl = container.querySelector('.tiptap-content');
    expect(editorEl).not.toBeNull();
  });

  it('submit button is disabled when there is no content or ai evaluation', () => {
    render(<CardLaudo />);

    const submitBtn = screen.getByText('Submeter laudo');
    expect(submitBtn.closest('button')?.disabled).toBe(true);
  });

  it('renders save button in edit mode', () => {
    render(
      <CardLaudo
        mode="edit"
        value={{
          json: null,
          html: '<p>Laudo customizado</p>',
          texto: 'Laudo customizado',
          resultadoIaValido: null,
        }}
      />
    );

    expect(screen.getByText('Salvar alterações')).toBeDefined();
  });
});
