import { describe, it, expect } from 'vitest';
import { validateCPF } from '@/utils/validators/cpf'

describe('validateCPF', () => {
  it('deve retornar true para um CPF válido', () => {
    expect(validateCPF('52998224725')).toBe(true);
    expect(validateCPF('529.982.247-25')).toBe(true);
  });

  it('deve retornar false para CPFs com menos de 11 dígitos', () => {
    expect(validateCPF('1234567890')).toBe(false);
    expect(validateCPF('123')).toBe(false);
  });

  it('deve retornar false para CPFs com todos os dígitos iguais', () => {
    expect(validateCPF('11111111111')).toBe(false);
    expect(validateCPF('00000000000')).toBe(false);
  });

  it('deve retornar false para CPFs com dígitos verificadores inválidos', () => {
    expect(validateCPF('12345678901')).toBe(false);
    expect(validateCPF('52998224726')).toBe(false);
  });

  it('deve lidar corretamente com caracteres não numéricos', () => {
    expect(validateCPF('529.982.247-25')).toBe(true);
    expect(validateCPF('529abc982def247gh25')).toBe(true);
  });

  it('deve retornar false para CPFs vazios', () => {
    expect(validateCPF('')).toBe(false);
  });
});