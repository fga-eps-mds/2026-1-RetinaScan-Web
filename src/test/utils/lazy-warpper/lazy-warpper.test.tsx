import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { lazy } from 'react';
import { withSuspense } from '@/utils/lazy-warpper/lazy-warpper';

describe('withSuspense', () => {
  it('deve renderizar o fallback de carregamento inicialmente', () => {
    const LazyComponent = lazy(() => new Promise(() => {}));

    render(withSuspense(LazyComponent));

    expect(screen.getByText('Carregando...')).toBeTruthy();
  });

  it('deve renderizar o componente quando ele for carregado', async () => {
    const ResolvedComponent = () => <div>Componente Pronto</div>;

    render(withSuspense(ResolvedComponent));

    const content = await screen.findByText('Componente Pronto');
    expect(content).toBeTruthy();
  });

  it('deve lidar com componentes lazy que resolvem com sucesso', async () => {
    const LazyComponent = lazy(() =>
      Promise.resolve({ default: () => <div>Lazy Loaded</div> })
    );

    render(withSuspense(LazyComponent));

    // O findBy espera até que o componente apareça no DOM
    const content = await screen.findByText('Lazy Loaded');
    expect(content).toBeTruthy();
    expect(screen.queryByText('Carregando...')).toBeNull();
  });
});
