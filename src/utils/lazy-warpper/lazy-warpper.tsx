import { Suspense } from 'react';

export function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Component />
    </Suspense>
  );
}
