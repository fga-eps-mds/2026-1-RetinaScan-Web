import { Ban, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
// Importação do Select adicionada
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
  // Novas props adicionadas aqui
  filtroPerfil: string;
  onFiltroPerfilChange: (value: string) => void; 
}

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
}: TabelaUsersProps) => {

  const isFirstLoad = !isFetched && isLoading;
  const temFiltroAtivo = Boolean(busca.trim()) || filtroPerfil !== 'TODOS';
  const mostrarLoadingGeral = isTyping || (!isFirstLoad && isFetching);
  const mostrarListaVazia = !isFirstLoad && !isError && !mostrarLoadingGeral && users.length === 0;

  return (
    <div className="overflow-hidden rounded-xl p-8 border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">Usuários Cadastrados</h1>
        
        {/* Nova div que agrupa o Select e o Input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          
          <Select value={filtroPerfil} onValueChange={onFiltroPerfilChange}>
            <SelectTrigger className="w-45 h-12 border-slate-200">
              <SelectValue placeholder="Filtrar por Perfil" />
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
              placeholder="Buscar por nome, e-mail ou CRM"
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              className="w-full pl-9 md:w-80 border-slate-200 h-12 pr-10"
            />
          </div>
          
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
            <TableHead className="font-semibold text-center">Perfil</TableHead>
            <TableHead className="font-semibold text-center">Cadastro</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isFirstLoad && (
            <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">Carregando...</TableCell></TableRow>
          )}

          {!isFirstLoad && isError && (
            <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-destructive font-medium">Erro ao carregar médicos cadastrados.</TableCell></TableRow>
          )}

          {mostrarListaVazia && <ListaVazia temFiltroAtivo={temFiltroAtivo} />}

          {!isFirstLoad && !isError && users.map((user: User) => (
            <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/50">
              <TableCell><Checkbox /></TableCell>
              <TableCell className="text-center text-md text-muted-foreground">{user.nomeCompleto}</TableCell>
              <TableCell className="text-center text-md text-muted-foreground">{user.email}</TableCell>
              <TableCell className="text-center text-md text-muted-foreground">{user.crm ?? '-'}</TableCell>
              <TableCell className="text-center">
                {user.tipoPerfil === 'ESPECIALISTA' ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md text-md whitespace-nowrap">
                    Especialista
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 rounded-md text-md whitespace-nowrap">
                    Médico
                  </Badge>
                )}
              </TableCell>
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