import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardHistorico } from '@/features/historico-exames'; 
import type { ExameHistory } from '@/features/historico-exames'; 

// NOTA: Removi o vi.mock do useFiltroExames para testar a lógica real

const mockDados: ExameHistory[] = [
  { 
    id: 'EX-1234-5678', 
    paciente: 'Ana Silva', 
    olho: 'OD' as any, 
    scoreIA: 90, 
    status: 'Normal', 
    data: '2026-05-10' 
  },
  { 
    id: 'EX-0000-1111', 
    paciente: 'Bruno Costa', 
    olho: 'OE' as any, 
    scoreIA: 30, 
    status: 'Prioridade', 
    data: '2026-05-09' 
  },
];

describe('CardHistorico (Integração)', () => {
  it('deve filtrar a tabela de verdade quando o usuário digita no campo de busca', async () => {
    render(<CardHistorico dados={mockDados} isLoading={false} isError={false} />);

    // Inicialmente, ambos os pacientes estão na tela
    expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    expect(screen.getByText('Bruno Costa')).toBeInTheDocument();

    const inputBusca = screen.getByPlaceholderText(/Buscar exame ou paciente/i);

    // Digita "Bruno" para testar a lógica real do hook + debounce (se houver)
    fireEvent.change(inputBusca, { target: { value: 'Bruno' } });

    // Como o seu hook usa debounce de 300ms, usamos waitFor para aguardar a atualização da lista
    await waitFor(() => {
      expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument();
      expect(screen.getByText('Bruno Costa')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('deve validar o formato do ID usando a lógica real do validador', async () => {
    render(<CardHistorico dados={mockDados} isLoading={false} isError={false} />);

    const inputBusca = screen.getByPlaceholderText(/Buscar exame ou paciente/i);

    // Digita um ID fora do padrão EX-0000-0000
    fireEvent.change(inputBusca, { target: { value: 'ID-ERRADO' } });

    // Verifica se a mensagem de erro da sua Regex real aparece
    expect(await screen.findByText(/Formato de ID inválido/i)).toBeInTheDocument();
    expect(inputBusca).toHaveClass('border-red-500');
  });

  it('deve limpar todos os campos e restaurar a lista ao clicar em Limpar Filtros', async () => {
    render(<CardHistorico dados={mockDados} isLoading={false} isError={false} />);

    const inputBusca = screen.getByPlaceholderText(/Buscar exame ou paciente/i);
    fireEvent.change(inputBusca, { target: { value: 'Paciente Inexistente' } });

    // Aguarda aparecer o estado vazio
    const btnLimpar = await screen.findByRole('button', { name: /limpar filtros/i });
    
    // Clica no botão real que chama a função limparFiltros do componente
    fireEvent.click(btnLimpar);

    // Verifica se os campos resetaram e a lista voltou ao normal
    await waitFor(() => {
      expect(inputBusca).toHaveValue('');
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
      expect(screen.getByText('Bruno Costa')).toBeInTheDocument();
    });
  });

  it('deve exibir o esqueleto durante o carregamento mesmo sem mocks', () => {
    render(<CardHistorico dados={[]} isLoading={true} isError={false} />);
    
    // No HistoricoSkeleton, os checkboxes ficam desabilitados
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();
  });
});