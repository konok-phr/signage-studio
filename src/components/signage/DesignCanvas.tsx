import { useRef, useState, useEffect } from 'react';
import { CanvasElement as CanvasElementType, AspectRatio } from '@/types/signage';
import { CanvasElement } from './CanvasElement';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

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
  const [autoScale, setAutoScale] = useState(1);
  const [manualZoom, setManualZoom] = useState(100);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 80;
        const containerHeight = containerRef.current.clientHeight - 120;
        
        const scaleX = containerWidth / ratio.width;
        const scaleY = containerHeight / ratio.height;
        
        const newAutoScale = Math.min(scaleX, scaleY, 1);
        setAutoScale(newAutoScale);
        setScale(newAutoScale * (manualZoom / 100));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [ratio, manualZoom]);

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

  const handleZoomIn = () => setManualZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setManualZoom(prev => Math.max(prev - 10, 50));
  const handleFitToScreen = () => setManualZoom(100);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{ratio.label}</span>
          <span className="text-xs">({ratio.width} × {ratio.height})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-24">
            <Slider
              value={[manualZoom]}
              onValueChange={([value]) => setManualZoom(value)}
              min={50}
              max={150}
              step={5}
              className="cursor-pointer"
            />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-center">{manualZoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFitToScreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-6 overflow-auto"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn(
            'relative bg-background shadow-xl border-2 border-border/50 rounded-sm',
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
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              opacity: 0.15,
            }}
          />

          {/* Center guides */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/20"
              style={{ transform: 'translateX(-0.5px)' }}
            />
            <div 
              className="absolute left-0 right-0 top-1/2 h-px bg-primary/20"
              style={{ transform: 'translateY(-0.5px)' }}
            />
          </div>

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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3 p-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 border-2 border-dashed border-muted-foreground/50 rounded" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground/80">Your canvas is empty</p>
                  <p className="text-sm text-muted-foreground">Add elements from the left panel or use a template</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
