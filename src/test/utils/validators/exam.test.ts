import { describe, it, expect } from 'vitest';
import { 
  isValidExamId, 
  sanitizeExamSearch, 
  isValidExamIdPattern 
} from '@/utils/validators/exam';

describe('Validators: Exam', () => {
  
  describe('isValidExamId (UUID)', () => {
    it('deve retornar true para um UUID válido', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(isValidExamId(validUUID)).toBe(true);
    });

    it('deve retornar false para strings que não seguem o formato UUID', () => {
      expect(isValidExamId('12345')).toBe(false);
      expect(isValidExamId(undefined)).toBe(false);
    });
  });

  describe('sanitizeExamSearch', () => {
    it('deve remover caracteres especiais mantendo letras, números e hífens', () => {
      const input = 'EX-1234@#%&*()-ABCD!';
      // CORREÇÃO: A regex remove o ")" mas mantém o hífen que já existia antes do ABCD
      const expected = 'EX-1234-ABCD'; 
      expect(sanitizeExamSearch(input)).toBe(expected);
    });

    it('deve manter uma string limpa inalterada', () => {
      const input = 'EX-2026-0001';
      expect(sanitizeExamSearch(input)).toBe('EX-2026-0001');
    });

    it('deve remover espaços em branco', () => {
      const input = 'EX 1234 5678';
      expect(sanitizeExamSearch(input)).toBe('EX12345678');
    });
  });

  describe('isValidExamIdPattern (Padrão EX-0000-0000)', () => {
    it('deve retornar true para o padrão correto EX-0000-0000', () => {
      expect(isValidExamIdPattern('EX-2026-1234')).toBe(true);
    });

    it('deve retornar true se a string estiver vazia', () => {
      expect(isValidExamIdPattern('')).toBe(true);
    });

    it('deve retornar false para formatos fora do padrão', () => {
      expect(isValidExamIdPattern('ex-2026-1234')).toBe(false); // Case sensitive
      expect(isValidExamIdPattern('EX-202-12345')).toBe(false); // Tamanho errado
    });
  });
});