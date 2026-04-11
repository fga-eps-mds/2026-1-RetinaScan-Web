/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

import AppLayout from '../../../components/layout/AppLayout';
import { ProtectedRoute } from './protected-route/ProtectedRoute';

const Home = lazy(() => import('@/pages/home/Home'));
const Exames = lazy(() => import('@/pages/home/exames/Exames'));
const NovoExame = lazy(() => import('@/pages/home/novo-exame/NovoExame'));
const Fila = lazy(() => import('@/pages/home/fila/Fila'));
const Login = lazy(() => import('@/pages/login/Login'));

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
