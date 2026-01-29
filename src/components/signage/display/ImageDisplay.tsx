import { useState, useCallback } from 'react';
import { ImageElement } from '@/types/signage';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageDisplayProps {
  element: ImageElement;
  onReady?: () => void;
}

export function ImageDisplay({ element, onReady }: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onReady?.();
  }, [onReady]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (!element.src) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading skeleton */}
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-muted-foreground text-sm">Image unavailable</p>
        </div>
      )}

      <img
        src={element.src}
        alt={element.alt || ''}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        style={{ objectFit: element.objectFit || 'cover' }}
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
      />
    </div>
  );
}
