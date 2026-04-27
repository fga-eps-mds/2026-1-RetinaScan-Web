import { describe, it, expect } from 'vitest';
import { formatCrm } from '@/utils/formatters/crm';

describe('formatCrm', () => {
  it('deve formatar um CRM completo com número e UF', () => {
    expect(formatCrm('123456sp')).toBe('123456/SP');
  });

  it('deve retornar apenas o número se a UF não for informada', () => {
    expect(formatCrm('123456')).toBe('123456');
  });

  it('deve converter a UF para maiúsculas', () => {
    expect(formatCrm('987654rj')).toBe('987654/RJ');
  });

  it('deve remover caracteres especiais', () => {
    expect(formatCrm('123.456-SP!')).toBe('123456/SP');
  });

  it('deve limitar o número a 6 dígitos e a UF a 2 letras', () => {
    expect(formatCrm('123456789SPBRASIL')).toBe('123456/SP');
  });

  it('deve lidar com strings vazias', () => {
    expect(formatCrm('')).toBe('');
  });

  it('deve formatar corretamente independente da ordem dos caracteres', () => {
    expect(formatCrm('SP123456')).toBe('123456/SP');
  });
});