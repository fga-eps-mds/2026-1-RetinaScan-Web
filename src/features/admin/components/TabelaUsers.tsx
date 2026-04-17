import { Trash2, Search} from 'lucide-react';
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

type UserStatus = 'Ativo' | 'Inativo';

type MockUser = {
  id: string;
  nome: string;
  email: string;
  crm: string;
  cadastro: string;
  status: UserStatus;
};

const mockUsers: MockUser[] = [
  {
    id: '1',
    nome: 'Ana Costa',
    email: 'ana.costa@retina.ia',
    crm: '123456-SP',
    cadastro: '01/01/2023',
    status: 'Inativo',
  },
  {
    id: '2',
    nome: 'Bruno Oliveira',
    email: 'bruno.oliveira@retina.ia',
    crm: '654321-GO',
    cadastro: '10/03/2023',
    status: 'Ativo',
  },
  {
    id: '3',
    nome: 'Carla Souza',
    email: 'carla.souza@retina.ia',
    crm: '777888-DF',
    cadastro: '22/05/2023',
    status: 'Ativo',
  },
];

const TabelaUsers = () => {
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return mockUsers;
    }

    return mockUsers.filter(
      (user) => user.nome.toLowerCase().includes(query) || user.crm.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">Usuários Cadastrados</h1>
        <div className="relative">
        <Search className = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/> 
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CRM"
          className="w-full md:w-80 pl-9"
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
              <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.crm}</TableCell>
                <TableCell>{user.cadastro}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Ativo' ? 'affirmative' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Trash2 />
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