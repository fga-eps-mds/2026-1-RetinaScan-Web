import { useSession } from '@/lib/auth-client';
import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
