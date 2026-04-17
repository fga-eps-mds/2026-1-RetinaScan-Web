import { Trash2, Search } from 'lucide-react';
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
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { Spinner } from '@/components/ui/spinner';
import type { User } from '../types/user';

type UserStatus = 'Ativo' | 'Inativo';

type TableUser = {
  id: string;
  nomeCompleto: string;
  email: string;
  crm: string;
  createdAt: string;
  status: UserStatus;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR').format(date);
};

const TabelaUsers = () => {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading, isError, error } = useGetAllUsers();

  const filteredUsers = useMemo<TableUser[]>(() => {
    const query = search.trim().toLowerCase();

    const normalizedUsers: TableUser[] = users.map((user: User) => ({
      id: user.id,
      nomeCompleto: user.nomeCompleto,
      email: user.email,
      crm: user.crm ?? '-',
      createdAt: formatDate(user.createdAt),
      status: user.status === 'ATIVO' ? 'Ativo' : 'Inativo',
    }));

    if (!query) {
      return normalizedUsers;
    }

    return normalizedUsers.filter(
      (user) =>
        user.nomeCompleto.toLowerCase().includes(query) ||
        user.crm.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [search, users]);

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-card">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    const message =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any)?.response?.data?.message || 'Erro ao carregar usuários.';

    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-destructive">{message}</p>
      </div>
    );
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CRM"
            className="w-full pl-9 md:w-80"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead> </TableHead>
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">E-mail</TableHead>
            <TableHead className="font-semibold">CRM</TableHead>
            <TableHead className="font-semibold">Cadastro</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredUsers.length === 0 ? (
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
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>

                <TableCell className="font-medium">
                  {user.nomeCompleto}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.crm}</TableCell>
                <TableCell>{user.createdAt}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      user.status === 'Ativo' ? 'affirmative' : 'secondary'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TabelaUsers;
