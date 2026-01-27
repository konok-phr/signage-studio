import { Image, Film, Type, LayoutList, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ElementType } from '@/types/signage';

interface MediaSidebarProps {
  onAddElement: (type: ElementType) => void;
}

const mediaItems = [
  { type: 'image' as ElementType, icon: Image, label: 'Image', description: 'Single image' },
  { type: 'slideshow' as ElementType, icon: LayoutList, label: 'Slideshow', description: 'Image carousel' },
  { type: 'video' as ElementType, icon: Film, label: 'Video', description: 'Video player' },
  { type: 'ticker' as ElementType, icon: PlayCircle, label: 'Ticker', description: 'Scrolling text' },
  { type: 'text' as ElementType, icon: Type, label: 'Text', description: 'Text overlay' },
];

export function MediaSidebar({ onAddElement }: MediaSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-card border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Media Library</h2>
        <p className="text-sm text-muted-foreground">Drag to canvas or click to add</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {mediaItems.map((item) => (
            <Card 
              key={item.type}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onAddElement(item.type)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
