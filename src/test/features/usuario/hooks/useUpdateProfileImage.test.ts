import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation } from '@tanstack/react-query';
import { useUpdateProfileImage } from '@/features/usuario/hooks/useUpdateProfileImage';
import { updateProfileImage } from '@/features/usuario/api/updateProfileImage';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
}));

vi.mock('../api/updateProfileImage', () => ({
  updateProfileImage: vi.fn(),
}));

describe('useUpdateProfileImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve configurar useMutation com updateProfileImage como mutationFn', () => {
    vi.mocked(useMutation).mockReturnValue({} as any);

    useUpdateProfileImage();

    expect(useMutation).toHaveBeenCalledTimes(1);

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0];

    expect(mutationConfig.mutationFn).toBe(updateProfileImage);
  });
});
