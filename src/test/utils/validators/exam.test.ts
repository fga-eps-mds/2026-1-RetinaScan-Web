import { describe, it, expect } from 'vitest';
import { isValidExamId } from '@/utils/validators/exam'

describe('isValidExamId', () => {
  it('deve retornar true para um UUID válido', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    expect(isValidExamId(validUUID)).toBe(true);
  });

  it('deve retornar true para um UUID válido com letras maiúsculas', () => {
    const upperCaseUUID = '550E8400-E29B-41D4-A716-446655440000';
    expect(isValidExamId(upperCaseUUID)).toBe(true);
  });

  it('deve retornar false para uma string aleatória que não é UUID', () => {
    expect(isValidExamId('12345')).toBe(false);
    expect(isValidExamId('exame-id-invalido')).toBe(false);
  });

  it('deve retornar false para um UUID mal formatado (faltando blocos)', () => {
    const invalidUUID = '550e8400-e29b-41d4-a716';
    expect(isValidExamId(invalidUUID)).toBe(false);
  });

  it('deve retornar false se o id for undefined', () => {
    expect(isValidExamId(undefined)).toBe(false);
  });

  it('deve retornar false se o id for uma string vazia', () => {
    expect(isValidExamId('')).toBe(false);
  });

  it('deve retornar false se o UUID tiver caracteres especiais inválidos', () => {
    const invalidUUID = '550e8400-e29b-41d4-a716-44665544000g'; 
    expect(isValidExamId(invalidUUID)).toBe(false);
  });
});