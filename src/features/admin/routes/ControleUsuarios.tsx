import { Button } from '@/components/ui/button';
import TabelaUsers from '../components/TabelaUsers';
import ModalNovoUser from '../components/ModalNovoUser';
import { useState, useEffect, useMemo } from 'react';
import InfoCards from '../components/InfoCards';
import { useSearchMedicos } from '../hooks/useSearchMedicos';
import { useDebouncedValue } from '@/features/historico-exames/hooks/useDebounce'; 
import type { User } from '../types/user';
import { toast } from 'sonner';

const ControleUsuarios = () => {
  const [openModalNovoUser, setOpenModalNovoUser] = useState(false);
  const [busca, setBusca] = useState('');

  const buscaDebounced = useDebouncedValue(busca, 400);

  // Mapeia os parâmetros da API sanitizando inputs parciais para evitar HTTP 400
  const filters = useMemo(() => {
    const valorLimpado = buscaDebounced.trim();

    if (!valorLimpado) return {};

    const isNumeric = /^\d+$/.test(valorLimpado);
    // Regex estrita para garantir domínio completo antes de chavear para query de email
    const isCompleteEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorLimpado);

    return {
      nome: !isNumeric && !isCompleteEmail ? valorLimpado : undefined,
      crm: isNumeric ? valorLimpado : undefined,
      email: isCompleteEmail ? valorLimpado : undefined,
    };
  }, [buscaDebounced]);

  // Hook do TanStack Query para sincronização de estado assíncrono com cache
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isFetched,
  } = useSearchMedicos(filters);

  const users = apiResponse?.data || [];
  const isTyping = busca !== buscaDebounced;

  useEffect(() => {
    if (isError) {
      toast.error('Erro ao carregar usuários.', {
        description:
          error instanceof Error ? error.message : 'Erro na requisição da API.',
      });
    }
  }, [isError, error]);

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

        <TabelaUsers
          users={users}
          isLoading={isLoading}
          isError={isError}
          error={error}
          isFetching={isFetching}
          isFetched={isFetched}
          isTyping={isTyping}
          busca={busca}
          onBuscaChange={(value: string) => setBusca(value)}
        />

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