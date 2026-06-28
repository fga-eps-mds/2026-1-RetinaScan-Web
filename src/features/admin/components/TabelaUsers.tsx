import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ListaVazia } from './ListaVazia'; 
import { FeedbackBuscando } from './FeedbackBuscando';
import type { User } from '../types/user';

interface TabelaUsersProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  error: unknown; 
  isFetching: boolean;
  isFetched: boolean;
  isTyping: boolean;
  busca: string;
  onBuscaChange: (value: string) => void;
  filtroPerfil: string;
  onFiltroPerfilChange: (value: string) => void; 
  page?: number;
  totalPages?: number;
  pageSize?: number;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

const TabelaUsers = ({
  users = [],
  isLoading,
  isError,
  isFetching,
  isFetched,
  isTyping,
  busca = '',
  onBuscaChange,
  filtroPerfil,
  onFiltroPerfilChange,
  page = 1,
  totalPages = 1,
  pageSize = 6, 
  onNextPage,
  onPreviousPage,
}: TabelaUsersProps) => {

  const isFirstLoad = !isFetched && isLoading;
  const temFiltroAtivo = Boolean(busca.trim()) || filtroPerfil !== 'TODOS';
  const mostrarLoadingGeral = isTyping || (!isFirstLoad && isFetching);
  const mostrarListaVazia = !isFirstLoad && !isError && !mostrarLoadingGeral && users.length === 0;

  return (
    <div className="overflow-hidden rounded-xl p-5 border border-border bg-card">
      
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <h1 className="text-xl font-heading font-bold text-gray-900">Usuários Cadastrados</h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={filtroPerfil} onValueChange={onFiltroPerfilChange}>
            <SelectTrigger className="w-40 h-10 border-slate-200">
              <SelectValue placeholder="Filtrar Perfil" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="TODOS">Todos os Perfis</SelectItem>
              <SelectItem value="MEDICO">Apenas Médicos</SelectItem>
              <SelectItem value="ESPECIALISTA">Apenas Especialistas</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, e-mail..."
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              className="w-full pl-9 md:w-72 border-slate-200 h-10 pr-4"
            />
          </div>
        </div>
      </div>

      {mostrarLoadingGeral && <FeedbackBuscando isTyping={isTyping} />}

      <Table className={cn('transition-opacity', isTyping && 'opacity-60')}>
        <TableHeader className="text-md border-b">
          <TableRow className="border-none hover:bg-transparent h-12">
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold text-center">E-mail</TableHead>
            <TableHead className="font-semibold text-center">CRM</TableHead>
            <TableHead className="font-semibold text-center">Perfil</TableHead>
            <TableHead className="font-semibold text-center">Cadastro</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isFirstLoad && (
            <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Carregando...</TableCell></TableRow>
          )}

          {!isFirstLoad && isError && (
            <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-destructive font-medium">Erro ao carregar usuários cadastrados.</TableCell></TableRow>
          )}

          {mostrarListaVazia && (
             <TableRow><TableCell colSpan={6} className="py-8"><ListaVazia temFiltroAtivo={temFiltroAtivo} /></TableCell></TableRow>
          )}

          {!isFirstLoad && !isError && users.map((user: User) => (
            <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/50">
              <TableCell className="text-sm text-muted-foreground font-medium py-3">{user.nomeCompleto}</TableCell>
              <TableCell className="text-center text-sm text-muted-foreground py-3">{user.email}</TableCell>
              <TableCell className="text-center text-sm text-muted-foreground py-3">{user.crm ?? '-'}</TableCell>
              
              <TableCell className="text-center py-3">
                {user.tipoPerfil === 'ESPECIALISTA' ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                    Especialista
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                    Médico
                  </Badge>
                )}
              </TableCell>
              
              <TableCell className="text-center text-sm text-muted-foreground py-3">
                {dateFormatter.format(new Date(user.createdAt))}
              </TableCell>
              
              <TableCell className="text-center py-3">
                <Badge className="px-2 py-0.5 rounded-md text-xs whitespace-nowrap" variant={user.status === 'ATIVO' ? 'affirmative' : 'secondary'}>
                  {user.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {!isError && totalPages > 0 && (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            {pageSize} resultados - Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={page <= 1 || isFetching || isTyping}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={page >= totalPages || isFetching || isTyping}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelaUsers;