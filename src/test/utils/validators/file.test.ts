import { describe, it, expect } from 'vitest';
import { isValidFileType, isValidFileSize, validateFile } from '@/utils/validators/file';

describe('File Validators', () => {
  
  describe('isValidFileType', () => {
    it('deve retornar true para tipos permitidos', () => {
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      const jpgFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      expect(isValidFileType(pngFile)).toBe(true);
      expect(isValidFileType(jpgFile)).toBe(true);
    });

    it('deve retornar false para tipos não permitidos (ex: pdf, gif)', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const gifFile = new File([''], 'test.gif', { type: 'image/gif' });
      
      expect(isValidFileType(pdfFile)).toBe(false);
      expect(isValidFileType(gifFile)).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('deve retornar true para arquivos menores que 10MB', () => {
      // 5MB em bytes
      const smallFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'small.png');
      expect(isValidFileSize(smallFile)).toBe(true);
    });

    it('deve retornar true para arquivos no limite exato de 10MB', () => {
      const limitFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'limit.png');
      expect(isValidFileSize(limitFile)).toBe(true);
    });

    it('deve retornar false para arquivos maiores que 10MB', () => {
      // 10.1MB em bytes
      const bigFile = new File([new ArrayBuffer(10.1 * 1024 * 1024)], 'big.png');
      expect(isValidFileSize(bigFile)).toBe(false);
    });
  });

  describe('validateFile', () => {
    it('deve retornar null para um arquivo válido', () => {
      const validFile = new File([''], 'ok.png', { type: 'image/png' });
      expect(validateFile(validFile)).toBeNull();
    });

    it('deve retornar erro se o arquivo for null', () => {
      expect(validateFile(null)).toBe("Arquivo não selecionado.");
    });

    it('deve retornar erro para formato inválido', () => {
      const invalidType = new File([''], 'test.txt', { type: 'text/plain' });
      expect(validateFile(invalidType)).toBe("Formato inválido. Use apenas .jpg, .jpeg ou .png.");
    });

    it('deve retornar erro para tamanho excedido', () => {
      const tooBig = new File([new ArrayBuffer(11 * 1024 * 1024)], 'huge.png', { type: 'image/png' });
      expect(validateFile(tooBig)).toBe("O arquivo excede o limite de 10MB.");
    });
  });
});