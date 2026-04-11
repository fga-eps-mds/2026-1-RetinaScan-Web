import Exames from '@/pages/home/exames/Exames';
import Fila from '@/pages/home/fila/Fila';
import NovoExame from '@/pages/home/novo-exame/NovoExame';
import Login from '@/pages/login/Login';
import { createBrowserRouter } from 'react-router';
import AppLayout from '../AppLayout';
import { ProtectedRoute } from './protected-route/ProtectedRoute';
import Home from '@/pages/home/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Home />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exames',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Exames />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exames/novo',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <NovoExame />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/fila',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Fila />
        </AppLayout>
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
    element: <Login />,
  },
]);
