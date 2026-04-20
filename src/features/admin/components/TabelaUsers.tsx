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
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import type { User } from '../types/user';

type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';

const TabelaUsers = () => {
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading, isError, error } = useGetAllUsers();

  const formatDate = (isoDate: string) => {
    const parsed = new Date(isoDate);

    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR').format(parsed);
  };

  const getStatusBadge = (status: UserStatus) => {
    const statusMap: Record<
      UserStatus,
      'affirmative' | 'secondary' | 'destructive'
    > = {
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
      variant: statusMap[status],
      label: labelMap[status],
    };
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter(
      (user: User) =>
        user.nomeCompleto.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.crm?.toLowerCase().includes(query) ?? false)
    );
  }, [search, users]);

  if (isError) {
    toast.error('Erro ao carregar usuários.', {
      description: error instanceof Error ? error.message : undefined,
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">
          Usuários Cadastrados
        </h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="text"
            placeholder="Buscar por nome, e-mail ou CRM"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 md:w-80"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell
                colSpan={7}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                Carregando...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && isError && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-6 text-center text-sm text-destructive"
              >
                Erro ao carregar usuários.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && filteredUsers.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                {search
                  ? 'Nenhum usuário encontrado para a busca.'
                  : 'Nenhum usuário cadastrado.'}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            filteredUsers.map((user: User) => {
              const { variant, label } = getStatusBadge(
                user.status as UserStatus
              );

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>

                  <TableCell className="font-medium">
                    {user.nomeCompleto}
                  </TableCell>

                  <TableCell>{user.email}</TableCell>

                  <TableCell>{user.crm ?? '-'}</TableCell>

                  <TableCell>{formatDate(user.createdAt)}</TableCell>

                  <TableCell>
                    <Badge variant={variant}>{label}</Badge>
                  </TableCell>

                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Ban className="h-4 w-4" />
                    </Button>
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
