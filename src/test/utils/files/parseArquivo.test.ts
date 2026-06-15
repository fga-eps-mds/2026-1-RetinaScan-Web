import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseArquivo } from '@/utils/files/parseArquivo'; // Ajuste o caminho
import * as XLSX from 'xlsx';

// 1. Mockamos o comportamento interno do XLSX para não precisar de arquivos reais
vi.mock('xlsx', () => ({
  read: vi.fn().mockReturnValue({
    SheetNames: ['Planilha1'],
    Sheets: { Planilha1: {} },
  }),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

// 2. Mockamos as utilidades locais para focar apenas na lógica do parseArquivo
vi.mock('@/features/admin/types/convite', () => ({
  getCampo: vi.fn((row: any, keys: string[]) => {
    // Simula a busca do campo iterando pelas chaves possíveis
    for (const key of keys) {
      if (row[key] !== undefined) return row[key];
    }
    return '';
  }),
  normalizarTexto: vi.fn((texto: any) => (texto ? String(texto).trim() : '')),
  normalizarTipoPerfil: vi.fn((perfil: any) => perfil === 'MEDICO' || perfil === 'ESPECIALISTA' ? perfil : ''),
  validarEmail: vi.fn((email: string) => email.includes('@')), // Validação simples para o teste
}));

describe('parseArquivo', () => {
  // Objeto File falso para simular o upload (funciona mesmo em ambientes Node puros)
  const mockFile = { arrayBuffer: async () => new ArrayBuffer(0) } as unknown as File;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve extrair e mapear os convites com sucesso ignorando campos extras', async () => {
    // Arrange: Simula o retorno do XLSX com dados perfeitos
    vi.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue([
      { nome: 'Dr. João', email: 'joao@email.com', perfil: 'MEDICO' },
      { nome: 'Dra. Maria', 'e-mail': 'maria@email.com', 'tipo de perfil': 'ESPECIALISTA' },
    ]);

    // Act
    const resultado = await parseArquivo(mockFile);

    // Assert
    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toEqual({ nome: 'Dr. João', email: 'joao@email.com', tipoPerfil: 'MEDICO' });
    expect(resultado[1]).toEqual({ nome: 'Dra. Maria', email: 'maria@email.com', tipoPerfil: 'ESPECIALISTA' });
  });

  it('deve ignorar linhas completamente vazias', async () => {
    // Arrange: Simula dados com uma linha vazia no meio
    vi.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue([
      { nome: 'João', email: 'joao@email.com', perfil: 'MEDICO' },
      { nome: '', email: '', perfil: '' }, // Linha vazia
    ]);

    // Act
    const resultado = await parseArquivo(mockFile);

    // Assert
    expect(resultado).toHaveLength(1); // Ignorou a linha vazia e processou apenas a primeira
  });

  it('deve lançar erro se o nome estiver faltando', async () => {
    // Arrange
    vi.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue([
      { nome: '', email: 'teste@email.com', perfil: 'MEDICO' },
    ]);

    // Act & Assert
    await expect(parseArquivo(mockFile)).rejects.toThrow('Linha 2: nome obrigatório.');
  });

  it('deve lançar erro se o email for inválido', async () => {
    // Arrange
    vi.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue([
      { nome: 'João', email: 'email-sem-arroba', perfil: 'MEDICO' },
    ]);

    // Act & Assert
    await expect(parseArquivo(mockFile)).rejects.toThrow('Linha 2: email inválido.');
  });

  it('deve lançar erro se o tipoPerfil não for MEDICO ou ESPECIALISTA', async () => {
    // Arrange
    vi.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue([
      { nome: 'João', email: 'teste@email.com', perfil: 'ADMIN' },
    ]);

    // Act & Assert
    await expect(parseArquivo(mockFile)).rejects.toThrow('Linha 2: tipoPerfil deve ser MEDICO ou ESPECIALISTA.');
  });
});