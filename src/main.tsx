import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/styles/index.css';
import { RouterProvider } from 'react-router/dom';
import { Toaster } from './components/ui/sonner';
import { router } from './app/providers/router/Router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>
);
