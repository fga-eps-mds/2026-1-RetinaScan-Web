import { describe, it, expect } from 'vitest';
import { formatDateLabel, formatDateInput } from '@/utils/date/index';

describe('Date Utilities', () => {
  describe('formatDateLabel', () => {
    it('deve retornar "Não informada" para valores nulos ou indefinidos', () => {
      expect(formatDateLabel(null)).toBe('Não informada');
      expect(formatDateLabel(undefined)).toBe('Não informada');
      expect(formatDateLabel('')).toBe('Não informada');
    });

    it('deve formatar uma data corretamente no padrão pt-BR', () => {
      const date = new Date(2026, 3, 26); // 26 de Abril de 2026
      expect(formatDateLabel(date)).toBe('26/04/2026');
    });

    it('deve aceitar uma string de data válida', () => {
      expect(formatDateLabel('2026-04-26T10:00:00Z')).toBe('26/04/2026');
    });

    it('deve retornar "Não informada" para strings de data inválidas', () => {
      expect(formatDateLabel('data-invalida')).toBe('Não informada');
    });
  });

  describe('formatDateInput', () => {
    it('deve retornar string vazia para valores nulos ou indefinidos', () => {
      expect(formatDateInput(null)).toBe('');
      expect(formatDateInput(undefined)).toBe('');
    });

    it('deve formatar a data no padrão YYYY-MM-DD para inputs HTML', () => {
      const date = new Date(2026, 3, 26); // Abril é mês 3 no constructor do Date
      expect(formatDateInput(date)).toBe('2026-04-26');
    });

    it('deve respeitar o fuso horário local ao formatar', () => {
      // Testa se a lógica de compensação de timezone evita que a data mude ao converter para ISO
      const date = new Date('2026-04-26T00:00:00'); 
      expect(formatDateInput(date)).toBe('2026-04-26');
    });

    it('deve retornar vazio para anos fora do intervalo 1900-2100', () => {
      expect(formatDateInput(new Date(1899, 11, 31))).toBe('');
      expect(formatDateInput(new Date(2101, 0, 1))).toBe('');
    });

    it('deve retornar vazio para datas inválidas', () => {
      expect(formatDateInput('not-a-date')).toBe('');
    });
  });
});