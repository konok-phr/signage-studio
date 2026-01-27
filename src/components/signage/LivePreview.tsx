import { useRef, useState, useEffect } from 'react';
import { CanvasElement as CanvasElementType, AspectRatio, SlideshowElement } from '@/types/signage';
import { cn } from '@/lib/utils';
import { Play, Eye } from 'lucide-react';

interface LivePreviewProps {
  ratio: AspectRatio;
  elements: CanvasElementType[];
}

// Slideshow component with actual transitions
function SlideshowPreview({ 
  element, 
  scale 
}: { 
  element: SlideshowElement; 
  scale: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
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
      {element.images.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            element.transition === 'fade' ? (
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            ) : (
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            )
          )}
        />
      ))}
      {/* Slide indicators */}
      {element.images.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {element.images.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1 h-1 rounded-full transition-colors",
                index === currentIndex ? 'bg-primary-foreground' : 'bg-primary-foreground/40'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LivePreview({ ratio, elements }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = containerRef.current.clientHeight - 32;
        
        const scaleX = containerWidth / ratio.width;
        const scaleY = containerHeight / ratio.height;
        
        setScale(Math.min(scaleX, scaleY, 0.5));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [ratio]);

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
        return element.src ? (
          <div key={element.id} style={style} className="overflow-hidden">
            <video
              src={element.src}
              className="w-full h-full object-cover"
              autoPlay={element.autoPlay}
              loop={element.loop}
              muted={element.muted}
            />
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
                animation: `marquee ${20 / element.speed}s linear infinite`,
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
    <div className="h-full flex flex-col bg-card border-l">
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Eye className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Live Preview</h2>
            <p className="text-xs text-muted-foreground">Real-time output</p>
          </div>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-muted/20 to-muted/40"
      >
        <div
          className={cn(
            'relative bg-background shadow-lg border overflow-hidden rounded-sm',
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
              <div className="text-center space-y-1">
                <Play className="h-6 w-6 text-muted-foreground/50 mx-auto" />
                <p className="text-xs text-muted-foreground">Preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 border-t bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">
          {ratio.label} • {ratio.width}×{ratio.height}
        </p>
      </div>
    </div>
  );
}
