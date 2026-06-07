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
  // Controle de visibilidade do modal de criação de usuários
  const [openModalNovoUser, setOpenModalNovoUser] = useState(false);
  
  // Estado local do input de texto da busca
  const [busca, setBusca] = useState('');
  
  // Estado que armazena a seleção do dropdown de filtro por tipo de perfil
  const [filtroPerfil, setFiltroPerfil] = useState<string>('TODOS'); 

  // Aplica um atraso (debounce) de 400ms na string de busca para evitar 
  // disparar requisições à API a cada tecla digitada pelo usuário.
  const buscaDebounced = useDebouncedValue(busca, 400);

  // Memoriza a montagem do payload de filtros para a API.
  // Só é reexecutado quando o termo de busca (após o debounce) ou o filtro de perfil mudarem.
  const filters = useMemo(() => {
    const valorLimpado = buscaDebounced.trim();
    
    // Converte a opção "TODOS" da UI para undefined, evitando enviar um filtro nulo ao backend
    const perfilValue = filtroPerfil === 'TODOS' ? undefined : (filtroPerfil as 'MEDICO' | 'ESPECIALISTA');

    // Se não houver busca em texto, retorna apenas o filtro de perfil
    if (!valorLimpado) {
      return { tipoPerfil: perfilValue };
    }

    const isNumeric = /^\d+$/.test(valorLimpado);
    
    // Regex rigorosa para validar se a string é um e-mail completo
    const isCompleteEmail = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,8}$/.test(
      valorLimpado
    );
    
    // Roteamento inteligente de parâmetros: infere do que se trata a string digitada 
    // e preenche a chave correta para a API, prevenindo erros HTTP 400 (ex: mandar texto no campo CRM).
    return {
      nome: !isNumeric && !isCompleteEmail ? valorLimpado : undefined,
      crm: isNumeric ? valorLimpado : undefined,
      email: isCompleteEmail ? valorLimpado : undefined,
      tipoPerfil: perfilValue, 
    };
  }, [buscaDebounced, filtroPerfil]);

  // Hook do TanStack Query que gerencia a requisição, cache e status (loading/error).
  // Ele escuta o objeto "filters" e refaz a chamada à API automaticamente quando ele muda.
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
  
  // Flag derivada para feedback visual: indica se o usuário ainda está digitando
  // (o estado de busca atual está dessincronizado do estado debounced que foi para a API).
  const isTyping = busca !== buscaDebounced;

  // Listener para captura e exibição de erros da API utilizando a biblioteca Sonner
  useEffect(() => {
    if (isError) {
      toast.error('Erro ao carregar usuários.', {
        description:
          error instanceof Error ? error.message : 'Erro na requisição da API.',
      });
    }
  }, [isError, error]);

  // Valores derivados dos dados em cache para alimentar os cards indicadores no topo da tela
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

        {/* Repassa os dados da API, status de requisição e os controles de estado para a tabela */}
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
          filtroPerfil={filtroPerfil}
          onFiltroPerfilChange={setFiltroPerfil} 
        />

        {/* Renderiza o modal de cadastro. 
          Em caso de sucesso (onUserCreated), aciona o refetch do TanStack Query 
          para atualizar a tabela em tempo real com o novo registro.
        */}
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