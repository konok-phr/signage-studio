import { Image, Film, Type, LayoutList, PlayCircle, GripVertical, Music } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ElementType } from '@/types/signage';
import { DraggableMediaItem } from './DraggableMediaItem';

interface MediaSidebarProps {
  onAddElement: (type: ElementType) => void;
}

const mediaItems = [
  { 
    type: 'image' as ElementType, 
    icon: Image, 
    label: 'Image', 
    description: 'Single image with crop options',
    color: 'bg-blue-500/10 text-blue-600',
  },
  { 
    type: 'slideshow' as ElementType, 
    icon: LayoutList, 
    label: 'Slideshow', 
    description: 'Multiple images with transitions',
    color: 'bg-purple-500/10 text-purple-600',
  },
  { 
    type: 'video' as ElementType, 
    icon: Film, 
    label: 'Video', 
    description: 'Video playlist with loop',
    color: 'bg-pink-500/10 text-pink-600',
  },
  { 
    type: 'audio' as ElementType, 
    icon: Music, 
    label: 'Background Music', 
    description: 'Audio that plays in background',
    color: 'bg-orange-500/10 text-orange-600',
  },
  { 
    type: 'ticker' as ElementType, 
    icon: PlayCircle, 
    label: 'Ticker', 
    description: 'Scrolling announcement text',
    color: 'bg-amber-500/10 text-amber-600',
  },
  { 
    type: 'text' as ElementType, 
    icon: Type, 
    label: 'Text', 
    description: 'Static text with styling',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
];

export function MediaSidebar({ onAddElement }: MediaSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-card border-r">
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Elements</h2>
            <p className="text-xs text-muted-foreground">Drag or click to add</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {mediaItems.map((item) => (
            <DraggableMediaItem
              key={item.type}
              type={item.type}
              icon={item.icon}
              label={item.label}
              description={item.description}
              color={item.color}
              onAddElement={onAddElement}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-center text-muted-foreground">
          💡 Drag elements onto the canvas
        </p>
      </div>
    </div>
  );
}
