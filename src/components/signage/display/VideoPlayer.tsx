import { useState, useRef, useCallback, useEffect } from 'react';
import { VideoElement } from '@/types/signage';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  element: VideoElement;
  onReady?: () => void;
}

export function VideoPlayer({ element, onReady }: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Get all videos - combine src with videos array for backwards compatibility
  const allVideos = element.videos?.length 
    ? element.videos 
    : element.src 
      ? [{ src: element.src }] 
      : [];

  const handleVideoEnded = useCallback(() => {
    if (allVideos.length > 1) {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= allVideos.length) {
          return element.loop ? 0 : prev;
        }
        return next;
      });
      setIsLoading(true);
    }
  }, [allVideos.length, element.loop]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onReady?.();
  }, [onReady]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    // Auto-skip to next video after error
    if (allVideos.length > 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= allVideos.length) {
            return element.loop ? 0 : prev;
          }
          return next;
        });
      }, 1000);
    }
  }, [allVideos.length, element.loop]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  // When index changes, play the new video
  useEffect(() => {
    if (videoRef.current && element.autoPlay) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, try muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(console.error);
        }
      });
    }
  }, [currentIndex, element.autoPlay]);

  if (allVideos.length === 0) return null;

  const currentVideo = allVideos[currentIndex];
  const shouldLoop = allVideos.length === 1 && element.loop;

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 z-10",
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
      </div>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <p className="text-white/70 text-sm">Video unavailable</p>
        </div>
      )}

      <video
        ref={videoRef}
        key={currentIndex}
        src={currentVideo.src}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-50" : "opacity-100"
        )}
        autoPlay={element.autoPlay}
        loop={shouldLoop}
        muted={element.muted}
        playsInline
        preload="auto"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={handleVideoEnded}
      />
    </div>
  );
}
