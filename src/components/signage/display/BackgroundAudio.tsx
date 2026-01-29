import { useRef, useEffect, useState } from 'react';
import { AudioElement } from '@/types/signage';

interface BackgroundAudioProps {
  element: AudioElement;
}

export function BackgroundAudio({ element }: BackgroundAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = element.volume;
    }
  }, [element.volume]);

  // Handle autoplay restrictions
  useEffect(() => {
    if (audioRef.current && element.autoPlay && isReady) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked - will play on user interaction
        console.log('Audio autoplay blocked, waiting for user interaction');
      });
    }
  }, [element.autoPlay, isReady]);

  if (!element.src) return null;

  return (
    <audio
      ref={audioRef}
      src={element.src}
      loop={element.loop}
      preload="auto"
      onCanPlay={() => setIsReady(true)}
      style={{ display: 'none' }}
    />
  );
}
