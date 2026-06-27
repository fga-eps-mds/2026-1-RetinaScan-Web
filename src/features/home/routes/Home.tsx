import React from 'react';
import { authClient } from '@/lib/auth-client';
import { Spinner } from '@/components/ui/spinner';

import { AdminDashboard } from '../components/admin/AdminDashboard';
import { MedicoDashboard } from '../components/medico/MedicoDashboard';
import { EspecialistaDashboard } from '../components/especialista/EspecialistaDashboard';

// Strategy Pattern: mapeamento em O(1) dos componentes por tipo de perfil,
// evitando acoplamento e múltiplos if/switch cases.
const dashboardMap: Record<string, React.ElementType> = {
  ADMIN: AdminDashboard,
  MEDICO: MedicoDashboard,
  ESPECIALISTA: EspecialistaDashboard,
};

export const Home = () => {
  // Inicializa a sessão do cliente para validar a autenticação em background
  const { data: session, isPending } = authClient.useSession();

  // Impede a renderização da interface principal enquanto o estado de auth não for resolvido
  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const tipoPerfil = session?.user?.tipoPerfil;

  // Resolve dinamicamente o componente correto usando o mapa de perfis
  const SelectedDashboard = tipoPerfil ? dashboardMap[tipoPerfil] : undefined;

  // Renderiza a view do usuário se o mapeamento for bem-sucedido
  if (SelectedDashboard) {
    return <SelectedDashboard />;
  }

  // Fallback de segurança: bloqueia a UI para perfis não mapeados ou payload de sessão corrompido
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