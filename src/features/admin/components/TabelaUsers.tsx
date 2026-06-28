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
  pageSize = 10,
  onNextPage,
  onPreviousPage,
}: TabelaUsersProps) => {

  const isFirstLoad = !isFetched && isLoading;
  const temFiltroAtivo = Boolean(busca.trim()) || filtroPerfil !== 'TODOS';
  const mostrarLoadingGeral = isTyping || (!isFirstLoad && isFetching);
  const mostrarListaVazia = !isFirstLoad && !isError && !mostrarLoadingGeral && users.length === 0;

  return (
    <div className="w-full overflow-hidden rounded-xl p-5 border border-border bg-card">

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <h1 className="text-xl font-heading font-bold text-gray-900 shrink-0">Usuários Cadastrados</h1>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <Select value={filtroPerfil} onValueChange={onFiltroPerfilChange}>
            <SelectTrigger className="h-10 w-auto min-w-[140px] border-slate-200">
              <SelectValue placeholder="Filtrar Perfil" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="TODOS">Todos os Perfis</SelectItem>
              <SelectItem value="MEDICO">Apenas Médicos</SelectItem>
              <SelectItem value="ESPECIALISTA">Apenas Especialistas</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[160px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por nome, e-mail..."
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              className="w-full pl-9 border-slate-200 h-10 pr-4"
            />
          </div>
        </div>
      </div>

      {mostrarLoadingGeral && <FeedbackBuscando isTyping={isTyping} />}

      {/* ✅ overflow-x-auto: scroll horizontal se a tela for muito pequena */}
      <div className="w-full overflow-x-auto">
        <Table className={cn('w-full transition-opacity', isTyping && 'opacity-60')}>
          <TableHeader className="text-md border-b">
            <TableRow className="border-none hover:bg-transparent h-12">
              <TableHead className="font-semibold w-[22%]">Nome</TableHead>
              <TableHead className="font-semibold text-center w-[28%]">E-mail</TableHead>
              <TableHead className="font-semibold text-center w-[12%]">CRM</TableHead>
              <TableHead className="font-semibold text-center w-[13%]">Perfil</TableHead>
              <TableHead className="font-semibold text-center w-[13%]">Cadastro</TableHead>
              <TableHead className="font-semibold text-center w-[12%]">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isFirstLoad && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            )}

            {!isFirstLoad && isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-destructive font-medium">
                  Erro ao carregar usuários cadastrados.
                </TableCell>
              </TableRow>
            )}

            {mostrarListaVazia && (
              <TableRow>
                <TableCell colSpan={6} className="py-8">
                  <ListaVazia temFiltroAtivo={temFiltroAtivo} />
                </TableCell>
              </TableRow>
            )}

            {!isFirstLoad && !isError && users.map((user: User) => (
              <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/50">
                <TableCell className="text-sm text-muted-foreground font-medium py-3 max-w-0">
                  <span className="block truncate">{user.nomeCompleto}</span>
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground py-3 max-w-0">
                  <span className="block truncate">{user.email}</span>
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground py-3">
                  {user.crm ?? '-'}
                </TableCell>
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
                  <Badge
                    className="px-2 py-0.5 rounded-md text-xs whitespace-nowrap"
                    variant={user.status === 'ATIVO' ? 'affirmative' : 'secondary'}
                  >
                    {user.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isError && totalPages > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {pageSize} resultados — Página {page} de {totalPages}
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