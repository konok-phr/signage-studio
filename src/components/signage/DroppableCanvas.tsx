import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableCanvasProps {
  children: React.ReactNode;
  canvasStyle: React.CSSProperties;
  onClick: (e: React.MouseEvent) => void;
}

export function DroppableCanvas({ children, canvasStyle, onClick }: DroppableCanvasProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative bg-background shadow-xl border-2 rounded-sm transition-all duration-200',
        isOver ? 'border-primary ring-4 ring-primary/20' : 'border-border/50'
      )}
      style={canvasStyle}
      onClick={onClick}
    >
      {/* Drop indicator overlay */}
      {isOver && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-pulse">
            Drop to add element
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
