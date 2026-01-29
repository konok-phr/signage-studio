import { CanvasElement, ImageElement, TextElement, TickerElement, VideoElement, SlideshowElement, AudioElement } from '@/types/signage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Copy, ArrowUp, ArrowDown, ChevronDown, Palette, Type, Settings2, Image as ImageIcon, Film, LayoutList, PlayCircle, Music } from 'lucide-react';
import { SlideshowPanel } from './SlideshowPanel';
import { ImageCropPanel } from './ImageCropPanel';
import { VideoPlaylistPanel } from './VideoPlaylistPanel';
import { AudioPanel } from './AudioPanel';
import { cn } from '@/lib/utils';

interface PropertyPanelProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const elementIcons = {
  image: ImageIcon,
  video: Film,
  text: Type,
  ticker: PlayCircle,
  slideshow: LayoutList,
  audio: Music,
};

export function PropertyPanel({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
}: PropertyPanelProps) {
  if (!element) {
    return (
      <div className="h-full flex flex-col bg-card border-l">
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="font-semibold text-lg">Properties</h2>
          <p className="text-xs text-muted-foreground">Element settings</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Select an element to edit</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = elementIcons[element.type];

  const renderTextProperties = (el: TextElement) => (
    <div className="space-y-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Content
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <Textarea
            value={el.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter your text..."
            rows={3}
            className="resize-none"
          />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Font Size</Label>
              <span className="text-xs text-muted-foreground">{el.fontSize}px</span>
            </div>
            <Slider
              value={[el.fontSize]}
              onValueChange={([value]) => onUpdate({ fontSize: value })}
              min={12}
              max={200}
              step={1}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Weight</Label>
              <Select
                value={el.fontWeight}
                onValueChange={(value) => onUpdate({ fontWeight: value as 'normal' | 'bold' })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Align</Label>
              <Select
                value={el.textAlign}
                onValueChange={(value) => onUpdate({ textAlign: value as 'left' | 'center' | 'right' })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Text</Label>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border cursor-pointer" 
                  style={{ backgroundColor: el.color }}
                />
                <Input
                  type="color"
                  value={el.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="h-8 w-full cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Background</Label>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border cursor-pointer" 
                  style={{ backgroundColor: el.backgroundColor }}
                />
                <Input
                  type="color"
                  value={el.backgroundColor === 'transparent' ? '#ffffff' : el.backgroundColor}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="h-8 w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderTickerProperties = (el: TickerElement) => (
    <div className="space-y-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Content
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <Textarea
            value={el.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter scrolling text..."
            rows={2}
            className="resize-none"
          />
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Animation
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Speed</Label>
              <span className="text-xs text-muted-foreground">{el.speed}x</span>
            </div>
            <Slider
              value={[el.speed]}
              onValueChange={([value]) => onUpdate({ speed: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Font Size</Label>
              <span className="text-xs text-muted-foreground">{el.fontSize}px</span>
            </div>
            <Slider
              value={[el.fontSize]}
              onValueChange={([value]) => onUpdate({ fontSize: value })}
              min={12}
              max={100}
              step={1}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Text</Label>
              <Input
                type="color"
                value={el.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="h-8 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Background</Label>
              <Input
                type="color"
                value={el.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="h-8 cursor-pointer"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderVideoProperties = (el: VideoElement) => (
    <VideoPlaylistPanel element={el} onUpdate={onUpdate} />
  );

  const renderAudioProperties = (el: AudioElement) => (
    <AudioPanel element={el} onUpdate={onUpdate} />
  );

  const renderProperties = () => {
    switch (element.type) {
      case 'image':
        return <ImageCropPanel element={element as ImageElement} onUpdate={onUpdate} />;
      case 'text':
        return renderTextProperties(element as TextElement);
      case 'ticker':
        return renderTickerProperties(element as TickerElement);
      case 'video':
        return renderVideoProperties(element as VideoElement);
      case 'slideshow':
        return <SlideshowPanel element={element as SlideshowElement} onUpdate={onUpdate} />;
      case 'audio':
        return renderAudioProperties(element as AudioElement);
      default:
        return <p className="text-sm text-muted-foreground">No properties available</p>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold capitalize">{element.type}</h2>
            <p className="text-xs text-muted-foreground">Edit properties</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Position & Size */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Transform
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">X</Label>
                  <Input
                    type="number"
                    value={Math.round(element.position.x)}
                    onChange={(e) => onUpdate({ position: { ...element.position, x: Number(e.target.value) } })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Y</Label>
                  <Input
                    type="number"
                    value={Math.round(element.position.y)}
                    onChange={(e) => onUpdate({ position: { ...element.position, y: Number(e.target.value) } })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    type="number"
                    value={Math.round(element.size.width)}
                    onChange={(e) => onUpdate({ size: { ...element.size, width: Number(e.target.value) } })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Height</Label>
                  <Input
                    type="number"
                    value={Math.round(element.size.height)}
                    onChange={(e) => onUpdate({ size: { ...element.size, height: Number(e.target.value) } })}
                    className="h-8"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="h-px bg-border" />

          {/* Type-specific properties */}
          {renderProperties()}
        </div>
      </ScrollArea>

      {/* Actions Footer */}
      <div className="p-3 border-t bg-muted/30 space-y-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-8" onClick={onBringToFront}>
            <ArrowUp className="h-3.5 w-3.5 mr-1" /> Front
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-8" onClick={onSendToBack}>
            <ArrowDown className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-8" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
          </Button>
          <Button variant="destructive" size="sm" className="flex-1 h-8" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
