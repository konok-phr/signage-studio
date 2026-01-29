import { useRef, useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CanvasElement as CanvasElementType, AspectRatio, SlideshowElement, VideoElement } from '@/types/signage';
import { cn } from '@/lib/utils';
import { Play, Loader2 } from 'lucide-react';
import { getTickerDurationSeconds, getTickerStartOffsetSeconds } from '@/lib/ticker';

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ratio: AspectRatio;
  elements: CanvasElementType[];
}

// Optimized Slideshow component with preloading
function SlideshowPreview({ 
  element, 
  scale 
}: { 
  element: SlideshowElement; 
  scale: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    element.images.forEach((img, index) => {
      const image = new Image();
      image.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
      image.src = img.src;
    });
  }, [element.images]);
  
  useEffect(() => {
    if (!element.autoPlay || element.images.length <= 1) return;
    
    const currentImage = element.images[currentIndex];
    const duration = (currentImage?.duration || 5) * 1000;
    
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % element.images.length);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [currentIndex, element.images, element.autoPlay]);
  
  if (element.images.length === 0) {
    return <div className="w-full h-full bg-muted" />;
  }
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {!loadedImages.has(0) && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      {element.images.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            index === currentIndex && loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
      {element.images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {element.images.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? 'bg-primary-foreground' : 'bg-primary-foreground/40'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Optimized Video component with loading state
function VideoPreview({
  element,
  scale
}: {
  element: VideoElement;
  scale: number;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const allVideos = element.videos?.length 
    ? element.videos 
    : element.src 
      ? [{ src: element.src }] 
      : [];

  // Reset to first video when playlist changes
  useEffect(() => {
    setCurrentIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [allVideos.map((v) => v.src).join('|')]);

  const currentVideo = allVideos[currentIndex];
  const shouldLoop = allVideos.length === 1 && element.loop;

  const goNext = useCallback(() => {
    if (allVideos.length <= 1) return;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= allVideos.length) return element.loop ? 0 : prev;
      return next;
    });
    setIsLoading(true);
  }, [allVideos.length, element.loop]);

  const handleEnded = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    setTimeout(goNext, 800);
  }, [goNext]);

  if (allVideos.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/70 z-10">
          <span className="text-sm text-muted-foreground">Video unavailable</span>
        </div>
      )}
      <video
        key={currentIndex}
        src={currentVideo?.src}
        className="w-full h-full object-cover"
        autoPlay={element.autoPlay}
        loop={shouldLoop}
        muted={element.muted}
        playsInline
        preload="auto"
        onCanPlay={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onLoadStart={() => setIsLoading(true)}
        onEnded={handleEnded}
        onError={handleError}
      />
    </div>
  );
}

export function PreviewModal({ open, onOpenChange, ratio, elements }: PreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!open) return;
    
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48;
        const containerHeight = containerRef.current.clientHeight - 48;
        
        const scaleX = containerWidth / ratio.width;
        const scaleY = containerHeight / ratio.height;
        
        setScale(Math.min(scaleX, scaleY, 0.6));
      }
    };

    const timer = setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [ratio, open]);

  const renderElement = (element: CanvasElementType) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.position.x * scale,
      top: element.position.y * scale,
      width: element.size.width * scale,
      height: element.size.height * scale,
      zIndex: element.zIndex,
    };

    switch (element.type) {
      case 'image':
        return element.src ? (
          <div key={element.id} style={style} className="overflow-hidden">
            <img
              src={element.src}
              alt={element.alt || ''}
              className="w-full h-full"
              style={{ objectFit: element.objectFit || 'cover' }}
            />
          </div>
        ) : (
          <div key={element.id} style={style} className="bg-muted/50" />
        );

      case 'video':
        const hasVideos = element.src || (element.videos && element.videos.length > 0);
        return hasVideos ? (
          <div key={element.id} style={style} className="overflow-hidden">
            <VideoPreview element={element} scale={scale} />
          </div>
        ) : (
          <div key={element.id} style={style} className="bg-muted/50" />
        );

      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...style,
              fontSize: element.fontSize * scale,
              fontWeight: element.fontWeight,
              color: element.color,
              backgroundColor: element.backgroundColor,
              textAlign: element.textAlign,
              fontFamily: element.fontFamily,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: 4 * scale,
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.3,
            }}
          >
            {element.content}
          </div>
        );

      case 'ticker':
        const tickerDuration = getTickerDurationSeconds(element.speed);
        const tickerStartOffset = getTickerStartOffsetSeconds(tickerDuration);
        return (
          <div
            key={element.id}
            style={{
              ...style,
              fontSize: element.fontSize * scale,
              color: element.color,
              backgroundColor: element.backgroundColor,
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <div 
              className="whitespace-nowrap"
              style={{
                animation: `marquee ${tickerDuration}s linear infinite`,
                animationDelay: `-${tickerStartOffset}s`,
                willChange: 'transform',
              }}
            >
              {element.text}
            </div>
          </div>
        );

      case 'slideshow':
        return (
          <div key={element.id} style={style} className="overflow-hidden">
            <SlideshowPreview element={element} scale={scale} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Live Preview - {ratio.label} ({ratio.width}×{ratio.height})
          </DialogTitle>
        </DialogHeader>
        
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-muted/20 to-muted/40"
        >
          <div
            className={cn(
              'relative bg-background shadow-xl border-2 overflow-hidden rounded',
              'transition-all duration-200'
            )}
            style={{
              width: ratio.width * scale,
              height: ratio.height * scale,
            }}
          >
            {elements.map(renderElement)}
            
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Play className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm text-muted-foreground">No elements to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
