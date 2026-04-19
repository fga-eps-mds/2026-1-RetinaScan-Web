import { Button } from '@/components/ui/button';
import TabelaUsers from '../components/TabelaUsers';
import ModalNovoUser from '../components/ModalNovoUser';
import { useState, useEffect } from 'react';
import InfoCards from '../components/InfoCards';
import { buildApiUrl } from '@/lib/api';

type ApiUser = {
  id: string;
  nomeCompleto: string;
  email: string;
  crm: string | null;
  tipoPerfil: 'ADMIN' | 'MEDICO';
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
  createdAt: string;
};

const ControleUsuarios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<ApiUser[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {

      try {
        const response = await fetch(buildApiUrl('/usuarios'), {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ApiUser[];

        if (isMounted) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setUsers([]);
        }
      }
    };

    void fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const totalUsers = users.length;
  const totalActiveUsers = users.filter((u) => u.status === 'ATIVO').length;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="text-center">
          <h2 className="text-4xl font-heading font-bold text-foreground sm:text-2xl">
            Gerenciamento e Controle de Acesso
          </h2>
          <p className="text-md text-muted-foreground">
            Cadastre e gerencie os profissionais da plataforma
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <InfoCards
            totalUsers={totalUsers}
            totalActiveUsers={totalActiveUsers}
          />

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-50 cursor-pointer border-0 font-semibold text-primary-foreground hover:opacity-90"
          >
            Novo Usuário
          </Button>
        </div>

        <TabelaUsers refreshKey={refreshKey} />
        <ModalNovoUser
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUserCreated={() => setRefreshKey((current) => current + 1)}
        />
      </div>
    </div>
  );
};

export default ControleUsuarios;
