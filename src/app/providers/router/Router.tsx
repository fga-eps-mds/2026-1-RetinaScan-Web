/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

import AppLayout from '../../../components/layout/AppLayout';
import { ProtectedRoute } from './protected-route/ProtectedRoute';
import Loading from '@/components/layout/loading/Loading';

const Home = lazy(() => import('@/features/home/routes/Home'));
const Exames = lazy(() => import('@/features/exames/routes/Exames'));
const NovoExame = lazy(() => import('@/features/exames/routes/NovoExame'));
const Fila = lazy(() => import('@/features/fila/routes/Fila'));
const ControleUsuarios = lazy(
  () => import('@/features/admin/routes/ControleUsuarios')
);
const Notificacoes = lazy(() => import('@/features/notificacoes/routes/Notificacoes'));
const Login = lazy(() => import('@/features/auth/routes/Login'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute allowed_roles={['ADMIN', 'MEDICO']}>
        <AppLayout>{withSuspense(Home)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exames',
    element: (
      <ProtectedRoute allowed_roles={['ADMIN', 'MEDICO']}>
        <AppLayout>{withSuspense(Exames)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exames/novo',
    element: (
      <ProtectedRoute allowed_roles={['ADMIN', 'MEDICO']}>
        <AppLayout>{withSuspense(NovoExame)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/fila',
    element: (
      <ProtectedRoute allowed_roles={['ADMIN', 'MEDICO']}>
        <AppLayout>{withSuspense(Fila)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/controle-usuarios',
    element: (
      <ProtectedRoute allowed_roles={['ADMIN']}>
        <AppLayout>{withSuspense(ControleUsuarios)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/notificacoes',
    element: (
      <ProtectedRoute allowed_roles={['ADMIN', 'MEDICO']}>
        <AppLayout>{withSuspense(Notificacoes)}</AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: withSuspense(Login),
  },
]);
