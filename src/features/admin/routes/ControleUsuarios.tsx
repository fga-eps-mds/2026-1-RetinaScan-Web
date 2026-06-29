import { Button } from '@/components/ui/button';
import TabelaUsers from '../components/TabelaUsers';
import ModalNovoUser from '../components/ModalNovoUser';
import ModalConvidarMedico from '../components/ModalConvidarMedico'; 
import { useState, useEffect, useMemo } from 'react';
import InfoCards from '../components/InfoCards';
import { useSearchMedicos } from '../hooks/useSearchMedicos';
import { useDebouncedValue } from '@/features/historico-exames/hooks/useDebounce';
import type { User } from '../types/user';
import { toast } from 'sonner';

const ControleUsuarios = () => {
  const [openModalNovoUser, setOpenModalNovoUser] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('TODOS'); 
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const buscaDebounced = useDebouncedValue(busca, 400);

  const filters = useMemo(() => {
    const valorLimpado = buscaDebounced.trim();
    const perfilValue = filtroPerfil === 'TODOS' ? undefined : (filtroPerfil as 'MEDICO' | 'ESPECIALISTA');

    if (!valorLimpado) {
      return { page, pageSize, tipoPerfil: perfilValue };
    }

    const isNumeric = /^\d+$/.test(valorLimpado);
    const isCompleteEmail = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,8}$/.test(valorLimpado);
    
    return {
      page,
      pageSize,
      nome: !isNumeric && !isCompleteEmail ? valorLimpado : undefined,
      crm: isNumeric ? valorLimpado : undefined,
      email: isCompleteEmail ? valorLimpado : undefined,
      tipoPerfil: perfilValue,
    };
  }, [buscaDebounced, filtroPerfil, page]);

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isFetched,
  } = useSearchMedicos(filters);

  const allUsers = apiResponse?.data || [];
  const displayedUsers = allUsers;

  const totalPages = apiResponse?.pagination?.totalPages ?? 1;
  const totalUsers = apiResponse?.pagination?.total ?? allUsers.length;
  const totalActiveUsers = allUsers.filter((user: User) => user.status === 'ATIVO').length;

  const isTyping = busca !== buscaDebounced;

  useEffect(() => {
    if (isError) {
      toast.error('Erro ao carregar usuários.', {
        description: error instanceof Error ? error.message : 'Erro na requisição da API.',
      });
    }
  }, [isError, error]);

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
          <InfoCards totalUsers={totalUsers} totalActiveUsers={totalActiveUsers} />
          <div className="flex items-center gap-2">
            <ModalConvidarMedico />
            <Button
              type="button"
              onClick={() => setOpenModalNovoUser(true)}
              className="w-50 cursor-pointer border-0 font-semibold text-primary-foreground hover:opacity-90"
            >
              Novo Usuário
            </Button>
          </div>
        </div>

        <TabelaUsers
          users={displayedUsers}
          isLoading={isLoading}
          isError={isError}
          error={error}
          isFetching={isFetching}
          isFetched={isFetched}
          isTyping={isTyping}
          busca={busca}
          onBuscaChange={(value: string) => { setBusca(value); setPage(1); }}
          filtroPerfil={filtroPerfil}
          onFiltroPerfilChange={(value: string) => { setFiltroPerfil(value); setPage(1); }}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onNextPage={() => setPage((p) => p + 1)}
          onPreviousPage={() => setPage((p) => Math.max(1, p - 1))}
        />

        <ModalNovoUser
          isOpen={openModalNovoUser}
          onClose={() => setOpenModalNovoUser(false)}
          onUserCreated={async () => {
            await refetch();
            setOpenModalNovoUser(false);
          }}
        />
      </div>
    </div>
  );
};

export default ControleUsuarios;