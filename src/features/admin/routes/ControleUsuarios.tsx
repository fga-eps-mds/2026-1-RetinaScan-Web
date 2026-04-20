import { Button } from '@/components/ui/button';
import TabelaUsers from '../components/TabelaUsers';
import ModalNovoUser from '../components/ModalNovoUser';
import { useState } from 'react';
import InfoCards from '../components/InfoCards';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import type { User } from '../types/user';

const ControleUsuarios = () => {
  const [openModalNovoUser, setOpenModalNovoUser] = useState(false);

  const { data: users = [], refetch } = useGetAllUsers();

  const totalUsers = users.length;
  const totalActiveUsers = users.filter(
    (user: User) => user.status === 'ATIVO'
  ).length;

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
            onClick={() => setOpenModalNovoUser(true)}
            className="w-50 cursor-pointer border-0 font-semibold text-primary-foreground hover:opacity-90"
          >
            Novo Usuário
          </Button>
        </div>

        <TabelaUsers />

        <ModalNovoUser
          isOpen={openModalNovoUser}
          onClose={() => setOpenModalNovoUser(false)}
          onUserCreated={() => {
            void refetch();
            setOpenModalNovoUser(false);
          }}
        />
      </div>
    </div>
  );
};

export default ControleUsuarios;
