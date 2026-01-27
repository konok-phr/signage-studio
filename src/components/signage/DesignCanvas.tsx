import { useRef, useState, useEffect } from 'react';
import { CanvasElement as CanvasElementType, AspectRatio } from '@/types/signage';
import { CanvasElement } from './CanvasElement';
import { cn } from '@/lib/utils';

interface DesignCanvasProps {
  ratio: AspectRatio;
  elements: CanvasElementType[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElementType>) => void;
  onDeleteElement: (id: string) => void;
}

export function DesignCanvas({
  ratio,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: DesignCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48;
        const containerHeight = containerRef.current.clientHeight - 48;
        
        const scaleX = containerWidth / ratio.width;
        const scaleY = containerHeight / ratio.height;
        
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [ratio]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElementId) {
        onDeleteElement(selectedElementId);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-muted/50 p-6 overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          'relative bg-background shadow-lg border',
          'transition-all duration-200'
        )}
        style={{
          width: ratio.width * scale,
          height: ratio.height * scale,
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
          }}
        />

        {/* Elements */}
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            scale={scale}
            onSelect={() => onSelectElement(element.id)}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onDelete={() => onDeleteElement(element.id)}
          />
        ))}

        {/* Empty state */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Your canvas is empty</p>
              <p className="text-sm">Add elements from the sidebar to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
