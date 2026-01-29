import { useState, useEffect, useCallback } from 'react';
import { SlideshowElement } from '@/types/signage';
import { cn } from '@/lib/utils';

interface SlideshowDisplayProps {
  element: SlideshowElement;
  onReady?: () => void;
}

export function SlideshowDisplay({ element, onReady }: SlideshowDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  // Preload all images
  useEffect(() => {
    element.images.forEach((img, index) => {
      const image = new Image();
      image.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
        if (index === 0) {
          onReady?.();
        }
      };
      image.src = img.src;
    });
  }, [element.images, onReady]);

  useEffect(() => {
    if (!element.autoPlay || element.images.length <= 1) return;
    
    const currentImage = element.images[currentIndex];
    const duration = (currentImage?.duration || 5) * 1000;
    
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % element.images.length);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [currentIndex, element.images, element.autoPlay]);
  
  if (element.images.length === 0) return null;
  
  const firstImageLoaded = loadedImages.has(0);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!firstImageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {element.images.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            index === currentIndex && loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
    </div>
  );
}
