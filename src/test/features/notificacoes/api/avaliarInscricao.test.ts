import { describe, it, expect, vi } from 'vitest';
import { api } from '@/shared/api';
import { avaliarInscricao, type AvaliarInscricaoPayload } from '@/features/notificacoes/api/avaliarInscricao'; // Lembre-se de ajustar o caminho

// Mock da instância base da API
vi.mock('@/shared/api', () => ({
  api: {
    patch: vi.fn(),
  },
}));

describe('avaliarInscricao', () => {
  const mockId = 'INSC-123';

  it('deve chamar a API corretamente quando a decisão for APROVADA', async () => {
    // Arrange
    const mockPayload: AvaliarInscricaoPayload = { decisao: 'APROVADA' };
    const mockResponseData = { success: true, message: 'Inscrição aprovada com sucesso' };
    
    (api.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResponseData });

    // Act
    const result = await avaliarInscricao(mockId, mockPayload);

    // Assert
    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(`/api/inscricoes/${mockId}/avaliar`, mockPayload);
    expect(result).toEqual(mockResponseData);
  });

  it('deve chamar a API corretamente e passar o motivo quando a decisão for REJEITADA', async () => {
    // Arrange
    const mockPayload: AvaliarInscricaoPayload = { 
      decisao: 'REJEITADA', 
      motivoRejeicao: 'Documentação incompleta' 
    };
    const mockResponseData = { success: true, message: 'Inscrição rejeitada com sucesso' };

    (api.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResponseData });

    // Act
    const result = await avaliarInscricao(mockId, mockPayload);

    // Assert
    expect(api.patch).toHaveBeenCalledWith(`/api/inscricoes/${mockId}/avaliar`, mockPayload);
    expect(result).toEqual(mockResponseData);
  });

  it('deve repassar o erro caso a chamada falhe', async () => {
    // Arrange
    const mockPayload: AvaliarInscricaoPayload = { decisao: 'APROVADA' };
    const mockError = new Error('Erro interno do servidor');
    
    (api.patch as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Act & Assert
    await expect(avaliarInscricao(mockId, mockPayload)).rejects.toThrow('Erro interno do servidor');
  });
});