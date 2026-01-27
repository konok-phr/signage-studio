import { useRef, useState, useEffect } from 'react';
import { CanvasElement as CanvasElementType, AspectRatio } from '@/types/signage';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
  ratio: AspectRatio;
  elements: CanvasElementType[];
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
          <div key={element.id} style={style}>
            <img
              src={element.src}
              alt={element.alt || ''}
              className="w-full h-full"
              style={{ objectFit: element.objectFit || 'cover' }}
            />
          </div>
        ) : (
          <div key={element.id} style={style} className="bg-muted" />
        );

      case 'video':
        return element.src ? (
          <div key={element.id} style={style}>
            <video
              src={element.src}
              className="w-full h-full object-cover"
              autoPlay={element.autoPlay}
              loop={element.loop}
              muted={element.muted}
            />
          </div>
        ) : (
          <div key={element.id} style={style} className="bg-muted" />
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
            <div className="whitespace-nowrap animate-marquee">
              {element.text}
            </div>
          </div>
        );

      case 'slideshow':
        return (
          <div key={element.id} style={style} className="bg-muted">
            {element.images.length > 0 && (
              <img
                src={element.images[0].src}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Live Preview</h2>
        <p className="text-xs text-muted-foreground">Real-time output preview</p>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 bg-muted/30"
      >
        <div
          className={cn(
            'relative bg-background shadow-md border overflow-hidden',
            'transition-all duration-200'
          )}
          style={{
            width: ratio.width * scale,
            height: ratio.height * scale,
          }}
        >
          {elements.map(renderElement)}
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
              Preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
