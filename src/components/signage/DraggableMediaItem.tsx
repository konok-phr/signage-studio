import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { ElementType } from '@/types/signage';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DraggableMediaItemProps {
  type: ElementType;
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  onAddElement: (type: ElementType) => void;
}

export function DraggableMediaItem({
  type,
  icon: Icon,
  label,
  description,
  color,
  onAddElement,
}: DraggableMediaItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `draggable-${type}`,
    data: { type },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] hover:border-primary/50",
        isDragging && "opacity-50 shadow-lg scale-105 z-50"
      )}
      onClick={() => onAddElement(type)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
