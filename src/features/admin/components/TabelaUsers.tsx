import { Ban, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ListaVazia } from './ListaVazia'; 
import { FeedbackBuscando } from './FeedbackBuscando';
import type { User } from '../types/user';


interface TabelaUsersProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  error: unknown; // Adicionado aqui para bater com o ControleUsuarios
  isFetching: boolean;
  isFetched: boolean;
  isTyping: boolean;
  busca: string;
  onBuscaChange: (value: string) => void;
}

const TabelaUsers = ({
  users = [],
  isLoading,
  isError,
  isFetching,
  isFetched,
  isTyping,
  busca = '', // Valor padrão inicializado para evitar o erro do .trim()
  onBuscaChange,
}: TabelaUsersProps) => {

  const isFirstLoad = !isFetched && isLoading;
  const temFiltroAtivo = Boolean(busca.trim());
  const mostrarLoadingGeral = isTyping || (!isFirstLoad && isFetching);
  const mostrarListaVazia = !isFirstLoad && !isError && !mostrarLoadingGeral && users.length === 0;

  return (
    <div className="overflow-hidden rounded-xl p-8 border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">Usuários Cadastrados</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, e-mail ou CRM"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            className="w-full pl-9 md:w-80 border-slate-200 h-12 pr-10"
          />
        </div>
      </div>

      {mostrarLoadingGeral && <FeedbackBuscando isTyping={isTyping} />}

      <Table className={cn('transition-opacity', isTyping && 'opacity-60')}>
        <TableHeader className="text-xl border-b">
          <TableRow className="border-none hover:bg-transparent h-16">
            <TableHead />
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">E-mail</TableHead>
            <TableHead className="font-semibold">CRM</TableHead>
            <TableHead className="font-semibold">Cadastro</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isFirstLoad && (
            <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Carregando...</TableCell></TableRow>
          )}

          {!isFirstLoad && isError && (
            <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-destructive font-medium">Erro ao carregar médicos cadastrados.</TableCell></TableRow>
          )}

          {mostrarListaVazia && <ListaVazia temFiltroAtivo={temFiltroAtivo} />}

          {!isFirstLoad && !isError && users.map((user: User) => (
            <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/50">
              <TableCell><Checkbox /></TableCell>
              <TableCell className="text-center text-md text-muted-foreground">{user.nomeCompleto}</TableCell>
              <TableCell className="text-center text-md text-muted-foreground">{user.email}</TableCell>
              <TableCell className="text-center text-md text-muted-foreground">{user.crm ?? '-'}</TableCell>
              <TableCell className="text-center text-md text-muted-foreground py-7">
                {new Intl.DateTimeFormat('pt-BR').format(new Date(user.createdAt))}
              </TableCell>
              <TableCell>
                <Badge className="px-3 py-1 rounded-md text-md whitespace-nowrap" variant={user.status === 'ATIVO' ? 'affirmative' : 'secondary'}>
                  {user.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm"><Ban className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TabelaUsers;