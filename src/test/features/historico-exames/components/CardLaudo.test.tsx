import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { CardLaudo } from '../../../../features/historico-exames/components/CardLaudo';

describe('CardLaudo', () => {
  it('renders action buttons and placeholder', async () => {
    render(<CardLaudo />);

    // Buttons
    expect(screen.getByText('Correto')).toBeDefined();
    expect(screen.getByText('Incorreto')).toBeDefined();

    // Placeholder text should be present in the DOM
    expect(screen.getByText('Digite o laudo do especialista...')).toBeDefined();
  });
});
