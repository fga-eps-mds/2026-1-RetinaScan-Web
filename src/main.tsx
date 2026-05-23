import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/styles/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { router } from './app/providers/router/Router';
import { RouterProvider } from 'react-router';
import { WebSocketBootStrap } from './components/websocket/websocket-bootstrap';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WebSocketBootStrap />
      <RouterProvider router={router} />
    </QueryClientProvider>
    <Toaster
      position="bottom-right"
      expand={false}
      richColors
      duration={3000}
      closeButton={true}
    />
  </StrictMode>
);
