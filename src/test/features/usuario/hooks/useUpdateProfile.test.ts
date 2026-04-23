import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/features/usuario/api/updateProfile';
import { userKeys } from '@/features/usuario/api/queryKeys';
import { useUpdateProfile } from '@/features/usuario/hooks/useUpdateProfile';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('@/features/usuario/api/updateProfile', () => ({
  updateProfile: vi.fn(),
}));

vi.mock('@/features/usuario/api/queryKeys', () => ({
  userKeys: {
    profile: ['user', 'profile'],
  },
}));

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve configurar useMutation com updateProfile como mutationFn', () => {
    const invalidateQueries = vi.fn();

    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries,
    } as any);

    vi.mocked(useMutation).mockReturnValue({} as any);

    useUpdateProfile();

    expect(useMutation).toHaveBeenCalledTimes(1);

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0];

    expect(mutationConfig.mutationFn).toBe(updateProfile);
    expect(typeof mutationConfig.onSuccess).toBe('function');
  });

  it('deve invalidar userKeys.profile no onSuccess', async () => {
    const invalidateQueries = vi.fn();

    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries,
    } as any);

    vi.mocked(useMutation).mockImplementation((config: any) => config as any);

    useUpdateProfile();

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onSuccess?: () => Promise<void> | void;
    };

    await mutationConfig.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: userKeys.profile,
    });
  });
});
