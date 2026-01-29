import { useState, useRef, useEffect } from 'react';
import { CanvasElement as CanvasElementType } from '@/types/signage';
import { cn } from '@/lib/utils';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElementType>) => void;
  onDelete: () => void;
}

export function CanvasElement({
  element,
  isSelected,
  scale,
  onSelect,
  onUpdate,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    
    if ((e.target as HTMLElement).dataset.resize) {
      setIsResizing(true);
      setResizeStart({
        width: element.size.width,
        height: element.size.height,
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - element.position.x * scale,
        y: e.clientY - element.position.y * scale,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = (e.clientX - dragStart.x) / scale;
        const newY = (e.clientY - dragStart.y) / scale;
        onUpdate({
          position: {
            x: Math.max(0, newX),
            y: Math.max(0, newY),
          },
        });
      }
      
      if (isResizing) {
        const deltaX = (e.clientX - resizeStart.x) / scale;
        const deltaY = (e.clientY - resizeStart.y) / scale;
        onUpdate({
          size: {
            width: Math.max(50, resizeStart.width + deltaX),
            height: Math.max(50, resizeStart.height + deltaY),
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, scale, onUpdate]);

  const renderContent = () => {
    switch (element.type) {
      case 'image':
        return element.src ? (
          <img
            src={element.src}
            alt={element.alt || ''}
            className="w-full h-full object-cover"
            style={{ objectFit: element.objectFit || 'cover' }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            Click to add image
          </div>
        );
      
      case 'video':
        return element.src ? (
          <video
            src={element.src}
            className="w-full h-full object-cover"
            autoPlay={element.autoPlay}
            loop={element.loop}
            muted={element.muted}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            Click to add video
          </div>
        );
      
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
            style={{
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              color: element.color,
              backgroundColor: element.backgroundColor,
              textAlign: element.textAlign,
              fontFamily: element.fontFamily,
            }}
          >
            {element.content || 'Double-click to edit'}
          </div>
        );
      
      case 'ticker':
        return (
          <div
            className="w-full h-full flex items-center overflow-hidden"
            style={{
              fontSize: element.fontSize,
              color: element.color,
              backgroundColor: element.backgroundColor,
            }}
          >
            <div className="whitespace-nowrap animate-marquee">
              {element.text || 'Enter ticker text...'}
            </div>
          </div>
        );
      
      case 'slideshow':
        return (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            {element.images.length > 0 ? (
              <img
                src={element.images[0].src}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              'Click to add images'
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-orange-600/30 flex items-center justify-center text-orange-600 rounded">
            <div className="text-center">
              <div className="text-2xl mb-1">🎵</div>
              <p className="text-xs font-medium">Background Music</p>
              {element.src && <p className="text-xs opacity-70">Audio loaded</p>}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'absolute cursor-move select-none',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{
        left: element.position.x * scale,
        top: element.position.y * scale,
        width: element.size.width * scale,
        height: element.size.height * scale,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      
      {isSelected && (
        <>
          {/* Resize handles */}
          <div
            data-resize="se"
            className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-primary rounded-sm cursor-se-resize"
          />
          <div
            data-resize="sw"
            className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-primary rounded-sm cursor-sw-resize"
          />
          <div
            data-resize="ne"
            className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-primary rounded-sm cursor-ne-resize"
          />
          <div
            data-resize="nw"
            className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-primary rounded-sm cursor-nw-resize"
          />
        </>
      )}
    </div>
  );
}
