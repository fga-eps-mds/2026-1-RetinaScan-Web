/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

import AppLayout from '../../../components/layout/AppLayout';
import { ProtectedRoute } from './protected-route/ProtectedRoute';

const Home = lazy(() => import('@/features/home/routes/Home'));
const Exames = lazy(() => import('@/features/exames/routes/Exames'));
const NovoExame = lazy(() => import('@/features/exames/routes/NovoExame'));
const Fila = lazy(() => import('@/features/fila/routes/Fila'));
const Login = lazy(() => import('@/features/auth/routes/Login'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<div>Carregando...</div>}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout>{withSuspense(Home)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exames',
    element: (
      <ProtectedRoute>
        <AppLayout>{withSuspense(Exames)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exames/novo',
    element: (
      <ProtectedRoute>
        <AppLayout>{withSuspense(NovoExame)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/fila',
    element: (
      <ProtectedRoute>
        <AppLayout>{withSuspense(Fila)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/usuarios',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <div>Usuários</div>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: withSuspense(Login),
  },
]);
