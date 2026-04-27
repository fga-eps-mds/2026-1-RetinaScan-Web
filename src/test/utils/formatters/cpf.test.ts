import { describe, it, expect } from 'vitest';
import { formatCpf } from '@/utils/formatters/cpf'; 

describe('formatCpf', () => {
  it('deve formatar uma string numérica completa de 11 dígitos', () => {
    expect(formatCpf('12345678901')).toBe('123.456.789-01');
  });

  it('deve remover caracteres não numéricos antes de formatar', () => {
    expect(formatCpf('123.456.789-01')).toBe('123.456.789-01');
    expect(formatCpf('123a456b789c01')).toBe('123.456.789-01');
  });

  it('deve formatar parcialmente enquanto o usuário digita', () => {
    expect(formatCpf('123')).toBe('123');
    expect(formatCpf('1234')).toBe('123.4');
    expect(formatCpf('123456')).toBe('123.456');
    expect(formatCpf('1234567')).toBe('123.456.7');
    expect(formatCpf('123456789')).toBe('123.456.789');
    expect(formatCpf('1234567890')).toBe('123.456.789-0');
  });

  it('deve limitar a string a 11 dígitos', () => {
    expect(formatCpf('123456789012345')).toBe('123.456.789-01');
  });

  it('deve retornar string vazia se o input for vazio', () => {
    expect(formatCpf('')).toBe('');
  });
});