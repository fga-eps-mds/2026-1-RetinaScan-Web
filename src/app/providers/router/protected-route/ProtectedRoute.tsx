import NotAuthorized from '@/components/layout/not-authorized/NotAuthorized';
import { useSession } from '@/lib/auth-client';
import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router';

export const ProtectedRoute = ({
  children,
  allowed_roles,
}: {
  children: JSX.Element;
  allowed_roles: string[];
}) => {
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

  const userRole = session.user.tipoPerfil;

  if (typeof userRole !== 'string' || !allowed_roles.includes(userRole)) {
    return <NotAuthorized />;
  }

  return children;
};
