import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabelaUsers from '@/features/admin/components/TabelaUsers';
import type { User } from '@/features/admin/types/user';

// Mock do Select do shadcn para contornar Radix UI
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange }: any) => (
    <select
      data-testid="perfil-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="TODOS">Todos os Perfis</option>
      <option value="MEDICO">Apenas Médicos</option>
      <option value="ESPECIALISTA">Apenas Especialistas</option>
    </select>
  ),
  SelectContent: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

const mockUsers: User[] = [
  {
    id: '1',
    nomeCompleto: 'Dr. Iderlan Silva',
    email: 'iderlan@retinascan.local',
    crm: '123456',
    status: 'ATIVO',
    createdAt: new Date(2026, 4, 17).toISOString(), 
    cpf: '000.000.000-00',
    dtNascimento: '1990-01-01',
    tipoPerfil: 'MEDICO',
    updatedAt: new Date(2026, 4, 17).toISOString(),
  },
  {
    id: '2',
    nomeCompleto: 'Dra. Ana Especialista',
    email: 'ana@retinascan.local',
    crm: '654321',
    status: 'ATIVO',
    createdAt: new Date(2026, 4, 17).toISOString(), 
    cpf: '111.111.111-11',
    dtNascimento: '1985-01-01',
    tipoPerfil: 'ESPECIALISTA',
    updatedAt: new Date(2026, 4, 17).toISOString(),
  },
];

const defaultProps = {
  users: [],
  isLoading: false,
  isError: false,
  error: null,
  isFetching: false,
  isFetched: true,
  isTyping: false,
  busca: '',
  onBuscaChange: vi.fn(),
  filtroPerfil: 'TODOS',
  onFiltroPerfilChange: vi.fn(),
  page: 1,
  totalPages: 1,
  pageSize: 6,
  onNextPage: vi.fn(),
  onPreviousPage: vi.fn(),
};

describe('TabelaUsers Component', () => {
  it('deve exibir o estado de carregamento inicial', () => {
    render(<TabelaUsers {...defaultProps} isLoading={true} isFetched={false} />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve exibir a mensagem de erro caso a requisição falhe', () => {
    render(<TabelaUsers {...defaultProps} isError={true} isFetched={true} />);
    expect(screen.getByText(/Erro ao carregar/i)).toBeInTheDocument();
  });

  it('deve exibir o componente de lista vazia se nenhum usuário for retornado', () => {
    render(
      <TabelaUsers 
        {...defaultProps} 
        users={[]} 
        isFetching={false} 
        isTyping={false} 
        isFetched={true} 
      />
    );
    // Usando matcher de função para ser mais flexível com a estrutura de elementos
    const emptyState = screen.getByText((content) => content.includes('médicos registrados'));
    expect(emptyState).toBeInTheDocument();
  });

  it('deve exibir o feedback de "Buscando" quando o usuário estiver digitando', () => {
    render(<TabelaUsers {...defaultProps} isTyping={true} />);
    expect(screen.getByText(/Buscando/i)).toBeInTheDocument();
  });

  it('deve renderizar a lista de usuários com as informações formatadas corretamente', () => {
    render(<TabelaUsers {...defaultProps} users={[mockUsers[0]]} />);
    expect(screen.getByText('Dr. Iderlan Silva')).toBeInTheDocument();
    expect(screen.getByText('17/05/2026')).toBeInTheDocument();
  });

  it('deve chamar onBuscaChange sempre que o usuário interagir com o input de texto', () => {
    const onBuscaChangeMock = vi.fn();
    render(<TabelaUsers {...defaultProps} onBuscaChange={onBuscaChangeMock} />);

    // Atualizado para o placeholder exato do seu componente
    const input = screen.getByPlaceholderText(/Buscar por nome, e-mail/i);
    fireEvent.change(input, { target: { value: 'medico01' } });

    expect(onBuscaChangeMock).toHaveBeenCalledWith('medico01');
  });

  it('deve renderizar corretamente as Badges visuais de Médico e Especialista', () => {
    render(<TabelaUsers {...defaultProps} users={mockUsers} />);
    expect(screen.getByText('Médico')).toBeInTheDocument();
    expect(screen.getByText('Especialista')).toBeInTheDocument();
  });

  it('deve chamar onFiltroPerfilChange ao alterar o Select de perfil', () => {
    const onFiltroPerfilChangeMock = vi.fn();
    render(<TabelaUsers {...defaultProps} onFiltroPerfilChange={onFiltroPerfilChangeMock} />);

    const select = screen.getByTestId('perfil-select');
    fireEvent.change(select, { target: { value: 'ESPECIALISTA' } });

    expect(onFiltroPerfilChangeMock).toHaveBeenCalledWith('ESPECIALISTA');
  });
});