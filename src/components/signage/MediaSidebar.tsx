import { Image, Film, Type, LayoutList, PlayCircle, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ElementType } from '@/types/signage';
import { cn } from '@/lib/utils';

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
    description: 'Video player with controls',
    color: 'bg-pink-500/10 text-pink-600',
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
        <h2 className="font-semibold text-lg">Elements</h2>
        <p className="text-xs text-muted-foreground">Click to add to canvas</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {mediaItems.map((item) => (
            <Card 
              key={item.type}
              className={cn(
                "cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02] hover:border-primary/50",
                "active:scale-[0.98]"
              )}
              onClick={() => onAddElement(item.type)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-lg", item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-center text-muted-foreground">
          Tip: Use templates for quick layouts
        </p>
      </div>
    </div>
  );
}
