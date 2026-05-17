import { Ban, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { User } from '../types/user';

type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';

// Definimos o que a tabela precisa receber lá do ControleUsuarios
interface TabelaUsersProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onSearchChange: (value: string) => void;
}

const TabelaUsers = ({ users, isLoading, isError, error, onSearchChange }: TabelaUsersProps) => {
  const [search, setSearch] = useState('');

  // Debounce simples: espera o usuário parar de digitar por 500ms para disparar a API
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, onSearchChange]);

  const formatDate = (isoDate: string) => {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(parsed);
  };

  const getStatusBadge = (status: UserStatus) => {
    const statusMap: Record<UserStatus, 'affirmative' | 'secondary' | 'destructive'> = {
      ATIVO: 'affirmative',
      INATIVO: 'secondary',
      BLOQUEADO: 'destructive',
    };

    const labelMap: Record<UserStatus, string> = {
      ATIVO: 'Ativo',
      INATIVO: 'Inativo',
      BLOQUEADO: 'Bloqueado',
    };

    return {
      variant: statusMap[status] || 'secondary',
      label: labelMap[status] || status,
    };
  };

  return (
    <div className="overflow-hidden rounded-xl p-8 border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">
          Usuários Cadastrados
        </h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou CRM"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 md:w-80 border-slate-200 h-12 pr-10 "
          />
        </div>
      </div>

      <Table>
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
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && isError && (
            <TableRow>
              <TableCell colSpan={7} className="py-6 text-center text-sm text-destructive">
                Erro ao carregar usuários.
              </TableCell>
            </TableRow>
          )}

          {/* CHECKLIST: O sistema deve informar quando não houver resultados */}
          {!isLoading && !isError && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                {search ? 'Nenhum médico encontrado para os critérios informados.' : 'Nenhum médico cadastrado.'}
              </TableCell>
            </TableRow>
          )}

          {/* Renderiza os dados vindos direto da API */}
          {!isLoading &&
            !isError &&
            users.map((user: User) => {
              const { variant, label } = getStatusBadge(user.status as UserStatus);

              return (
                <TableRow key={user.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell className="text-center text-md text-muted-foreground">{user.nomeCompleto}</TableCell>
                  <TableCell className="text-center text-md text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-center text-md text-muted-foreground">{user.crm ?? '-'}</TableCell>
                  <TableCell className="text-center text-md text-muted-foreground py-7">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className="px-3 py-1 rounded-md text-md whitespace-nowrap" variant={variant}>
                      {label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm"><Ban className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TabelaUsers;