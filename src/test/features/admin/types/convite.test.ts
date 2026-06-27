import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import {
  normalizarTexto,
  normalizarCabecalho,
  getCampo,
  validarEmail,
  normalizarTipoPerfil,
  linhaVazia,
  parseConvitesPlanilha,
} from '@/features/admin/types/convite';

vi.mock('xlsx', () => ({
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

describe('Utilitários de Parse de Planilha', () => {
  describe('normalizarTexto', () => {
    it('deve remover espaços em branco e tratar nulos', () => {
      expect(normalizarTexto('  texto  ')).toBe('texto');
      expect(normalizarTexto(null)).toBe('');
      expect(normalizarTexto(undefined)).toBe('');
    });
  });

  describe('normalizarCabecalho', () => {
    it('deve remover acentos, espaços extras e deixar minúsculo', () => {
      expect(normalizarCabecalho(' E-máil ')).toBe('e-mail');
      expect(normalizarCabecalho('Tipo de Perfil')).toBe('tipo de perfil');
    });
  });

  describe('validarEmail', () => {
    it('deve validar formatos de email corretamente', () => {
      expect(validarEmail('teste@email.com')).toBe(true);
      expect(validarEmail('teste@.com')).toBe(false);
      expect(validarEmail('teste.email.com')).toBe(false);
    });
  });

  describe('normalizarTipoPerfil', () => {
    it('deve retornar MEDICO ou ESPECIALISTA, e null para valores inválidos', () => {
      expect(normalizarTipoPerfil(' medico ')).toBe('MEDICO');
      expect(normalizarTipoPerfil('ESPECIALISTA')).toBe('ESPECIALISTA');
      expect(normalizarTipoPerfil('ADMIN')).toBeNull();
      expect(normalizarTipoPerfil(null)).toBeNull();
    });
  });

  describe('linhaVazia', () => {
    it('deve identificar se uma linha está completamente vazia', () => {
      expect(linhaVazia({ nome: '', email: undefined })).toBe(true);
      expect(linhaVazia({ nome: 'João', email: '' })).toBe(false);
    });
  });

  describe('getCampo', () => {
    it('deve buscar o valor de uma coluna considerando os aliases normalizados', () => {
      const linha = { ' Nome do Médico ': 'João', 'E-MÁIL': 'joao@email.com' };
      expect(getCampo(linha, ['nome do medico'])).toBe('João');
      expect(getCampo(linha, ['email', 'e-mail'])).toBe('joao@email.com');
      expect(getCampo(linha, ['idade'])).toBeUndefined();
    });
  });
});

describe('parseConvitesPlanilha', () => {
  const mockSheet = {} as XLSX.WorkSheet;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve extrair e mapear os convites com sucesso usando aliases diferentes', () => {
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
      { Nome: 'Dr. João', email: 'joao@email.com', Perfil: 'MEDICO' },
      { nome: 'Dra. Maria', 'E-mail': 'maria@email.com', 'Tipo de Perfil': 'ESPECIALISTA' },
    ]);

    const resultado = parseConvitesPlanilha(mockSheet);

    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toEqual({ nome: 'Dr. João', email: 'joao@email.com', tipoPerfil: 'MEDICO' });
    expect(resultado[1]).toEqual({ nome: 'Dra. Maria', email: 'maria@email.com', tipoPerfil: 'ESPECIALISTA' });
  });

  it('deve pular linhas completamente vazias sem lançar erro', () => {
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
      { nome: 'João', email: 'joao@email.com', perfil: 'MEDICO' },
      { nome: '', email: '', perfil: '' },
      { nome: 'Maria', email: 'maria@email.com', perfil: 'ESPECIALISTA' },
    ]);

    const resultado = parseConvitesPlanilha(mockSheet);

    expect(resultado).toHaveLength(2);
  });

  it('deve lançar erro se o nome for vazio em uma linha válida', () => {
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
      { nome: '', email: 'joao@email.com', perfil: 'MEDICO' },
    ]);

    expect(() => parseConvitesPlanilha(mockSheet)).toThrow('Linha 2: nome obrigatório.');
  });

  it('deve lançar erro se o email for inválido', () => {
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
      { nome: 'João', email: 'email-sem-arroba', perfil: 'MEDICO' },
    ]);

    expect(() => parseConvitesPlanilha(mockSheet)).toThrow('Linha 2: email inválido.');
  });

  it('deve lançar erro se o tipoPerfil não for MEDICO ou ESPECIALISTA', () => {
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
      { nome: 'João', email: 'joao@email.com', perfil: 'PACIENTE' },
    ]);

    expect(() => parseConvitesPlanilha(mockSheet)).toThrow('Linha 2: tipoPerfil deve ser MEDICO ou ESPECIALISTA.');
  });
});