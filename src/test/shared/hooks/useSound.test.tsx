// src/test/shared/hooks/useSound.test.tsx
import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useSound } from '@/shared/hooks/useSound';

type AudioMockInstance = {
  preload: string;
  volume: number;
  loop: boolean;
  playbackRate: number;
  currentTime: number;
  src: string;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
};

describe('useSound', () => {
  let audioMock: AudioMockInstance;
  let AudioConstructorMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    audioMock = {
      preload: '',
      volume: 1,
      loop: false,
      playbackRate: 1,
      currentTime: 99,
      src: '',
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
    };

    AudioConstructorMock = vi.fn(function (this: any, src: string) {
      audioMock.src = src;
      return audioMock;
    });

    vi.stubGlobal('Audio', AudioConstructorMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deve criar e configurar o elemento de áudio ao montar', () => {
    renderHook(() =>
      useSound('/sound.mp3', {
        volume: 0.5,
        loop: true,
        playbackRate: 1.25,
      })
    );

    expect(AudioConstructorMock).toHaveBeenCalledWith('/sound.mp3');
    expect(audioMock.preload).toBe('auto');
    expect(audioMock.volume).toBe(0.5);
    expect(audioMock.loop).toBe(true);
    expect(audioMock.playbackRate).toBe(1.25);
  });

  it('não deve tocar antes do unlock', async () => {
    const { result } = renderHook(() => useSound('/sound.mp3'));

    await act(async () => {
      await result.current.play();
    });

    expect(audioMock.play).not.toHaveBeenCalled();
  });

  it('deve tocar após interação do usuário', async () => {
    const { result } = renderHook(() => useSound('/sound.mp3'));

    act(() => {
      window.dispatchEvent(new MouseEvent('click'));
    });

    await act(async () => {
      await result.current.play();
    });

    expect(audioMock.currentTime).toBe(0);
    expect(audioMock.play).toHaveBeenCalledTimes(1);
  });

  it('deve desbloquear também com keydown', async () => {
    const { result } = renderHook(() => useSound('/sound.mp3'));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    await act(async () => {
      await result.current.play();
    });

    expect(audioMock.play).toHaveBeenCalledTimes(1);
  });

  it('deve fazer cleanup ao desmontar', () => {
    const { unmount } = renderHook(() => useSound('/sound.mp3'));

    unmount();

    expect(audioMock.pause).toHaveBeenCalledTimes(1);
    expect(audioMock.src).toBe('');
  });

  it('deve limitar volume entre 0 e 1', () => {
    renderHook(() => useSound('/sound.mp3', { volume: 2 }));
    expect(audioMock.volume).toBe(1);

    const anotherAudioMock: AudioMockInstance = {
      preload: '',
      volume: 1,
      loop: false,
      playbackRate: 1,
      currentTime: 0,
      src: '',
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
    };

    AudioConstructorMock = vi.fn(function (this: any, src: string) {
      anotherAudioMock.src = src;
      return anotherAudioMock;
    });

    vi.stubGlobal('Audio', AudioConstructorMock);

    renderHook(() => useSound('/sound.mp3', { volume: -1 }));
    expect(anotherAudioMock.volume).toBe(0);
  });

  it('não deve quebrar se audio.play rejeitar', async () => {
    audioMock.play = vi.fn().mockRejectedValue(new Error('blocked'));

    AudioConstructorMock = vi.fn(function (this: any, src: string) {
      audioMock.src = src;
      return audioMock;
    });

    vi.stubGlobal('Audio', AudioConstructorMock);

    const { result } = renderHook(() => useSound('/sound.mp3'));

    act(() => {
      window.dispatchEvent(new MouseEvent('click'));
    });

    await expect(
      act(async () => {
        await result.current.play();
      })
    ).resolves.not.toThrow();

    expect(audioMock.play).toHaveBeenCalledTimes(1);
  });
});
