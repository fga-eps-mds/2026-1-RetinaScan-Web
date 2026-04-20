import { describe, expect, it } from 'vitest';
import { userKeys } from '@/features/usuario/api/queryKeys';

describe('userKeys', () => {
  it('deve definir a chave all corretamente', () => {
    expect(userKeys.all).toEqual(['users']);
  });

  it('deve definir a chave list corretamente', () => {
    expect(userKeys.list).toEqual(['users', 'list']);
  });

  it('deve definir a chave profile corretamente', () => {
    expect(userKeys.profile).toEqual(['users', 'me']);
  });

  it('deve manter todas as chaves como arrays', () => {
    expect(Array.isArray(userKeys.all)).toBe(true);
    expect(Array.isArray(userKeys.list)).toBe(true);
    expect(Array.isArray(userKeys.profile)).toBe(true);
  });

  it('deve manter a hierarquia correta entre as chaves', () => {
    expect(userKeys.list[0]).toBe(userKeys.all[0]);
    expect(userKeys.profile[0]).toBe(userKeys.all[0]);
  });

  it('deve manter chaves distintas para list e profile', () => {
    expect(userKeys.list).not.toEqual(userKeys.profile);
  });
});
