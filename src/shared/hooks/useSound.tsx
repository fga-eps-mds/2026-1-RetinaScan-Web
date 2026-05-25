// src/hooks/useSound.ts
import { useCallback, useEffect, useRef } from 'react';

type UseSoundOptions = {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
};

export function useSound(
  src: string,
  { volume = 1, loop = false, playbackRate = 1 }: UseSoundOptions = {}
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = Math.min(Math.max(volume, 0), 1);
    audio.loop = loop;
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    const unlock = () => {
      unlockedRef.current = true;
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;

      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [src, volume, loop, playbackRate]);

  const play = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !unlockedRef.current) return;

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      // browser bloqueou
    }
  }, []);

  return { play };
}
