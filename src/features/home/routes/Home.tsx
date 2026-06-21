import React from 'react';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';

import { AdminDashboard } from '../components/admin/AdminDashboard';
import { MedicoDashboard } from '../components/medico/MedicoDashboard';
import { EspecialistaDashboard } from '../components/especialista/EspecialistaDashboard';

const dashboardMap: Record<string, React.ElementType> = {
  ADMIN: AdminDashboard,
  MEDICO: MedicoDashboard,
  ESPECIALISTA: EspecialistaDashboard,
};

export const Home = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const tipoPerfil = session?.user?.tipoPerfil;

  const SelectedDashboard = tipoPerfil ? dashboardMap[tipoPerfil] : undefined;

  if (SelectedDashboard) {
    return <SelectedDashboard />;
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <p className="text-destructive font-medium text-lg">Acesso não autorizado.</p>
      <p className="text-muted-foreground text-sm">
        O seu perfil ({tipoPerfil || 'Desconhecido'}) não possui um painel configurado ou não foi reconhecido.
      </p>
    </div>
  );
};

export default Home;