import { useRef, useCallback, useState, useEffect } from 'react';


interface SoundManagerReturn {
  playRoll: () => void;
  stopRoll: () => void;
  playReveal: () => void;
  playLock: () => void;
  playVictory: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (vol: number) => void;
}

// Simple beep sound generator using Web Audio API (no external files needed)
const createOscillatorSound = (
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

// Drum roll sound - rapid repeated hits
const playDrumRollSound = (audioContext: AudioContext, volume: number): ReturnType<typeof setInterval> => {
  const interval = setInterval(() => {
    createOscillatorSound(audioContext, 150 + Math.random() * 50, 0.05, 'triangle', volume * 0.5);
  }, 50);
  return interval;
};

// Reveal sound - ascending tone
const playRevealSound = (audioContext: AudioContext, volume: number): void => {
  createOscillatorSound(audioContext, 440, 0.15, 'sine', volume);
  setTimeout(() => {
    createOscillatorSound(audioContext, 554, 0.15, 'sine', volume);
  }, 100);
  setTimeout(() => {
    createOscillatorSound(audioContext, 659, 0.2, 'sine', volume);
  }, 200);
};

// Lock sound - satisfying click
const playLockSound = (audioContext: AudioContext, volume: number): void => {
  createOscillatorSound(audioContext, 800, 0.08, 'square', volume * 0.4);
  setTimeout(() => {
    createOscillatorSound(audioContext, 1200, 0.12, 'sine', volume * 0.3);
  }, 50);
};

// Victory fanfare
const playVictorySound = (audioContext: AudioContext, volume: number): void => {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillatorSound(audioContext, freq, 0.3, 'sine', volume);
    }, i * 150);
  });
};

export function useSoundManager(): SoundManagerReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Initialize AudioContext on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = globalThis.AudioContext || (globalThis as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  const playRoll = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    rollIntervalRef.current = playDrumRollSound(ctx, volume);
  }, [getAudioContext, isMuted, volume]);

  const stopRoll = useCallback(() => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
  }, []);

  const playReveal = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    playRevealSound(ctx, volume);
  }, [getAudioContext, isMuted, volume]);

  const playLock = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    playLockSound(ctx, volume);
  }, [getAudioContext, isMuted, volume]);

  const playVictory = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    playVictorySound(ctx, volume);
  }, [getAudioContext, isMuted, volume]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playRoll,
    stopRoll,
    playReveal,
    playLock,
    playVictory,
    isMuted,
    toggleMute,
    volume,
    setVolume
  };
}
