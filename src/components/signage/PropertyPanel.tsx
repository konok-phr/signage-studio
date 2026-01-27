import { CanvasElement, ImageElement, TextElement, TickerElement, VideoElement } from '@/types/signage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';

interface PropertyPanelProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

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
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
          <p className="text-center text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const renderImageProperties = (el: ImageElement) => (
    <>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={el.src}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="Paste image URL..."
        />
      </div>
      <div className="space-y-2">
        <Label>Object Fit</Label>
        <Select
          value={el.objectFit || 'cover'}
          onValueChange={(value) => onUpdate({ objectFit: value as 'cover' | 'contain' | 'fill' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderTextProperties = (el: TextElement) => (
    <>
      <div className="space-y-2">
        <Label>Text Content</Label>
        <Textarea
          value={el.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter your text..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Font Size: {el.fontSize}px</Label>
        <Slider
          value={[el.fontSize]}
          onValueChange={([value]) => onUpdate({ fontSize: value })}
          min={12}
          max={200}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <Label>Font Weight</Label>
        <Select
          value={el.fontWeight}
          onValueChange={(value) => onUpdate({ fontWeight: value as 'normal' | 'bold' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Text Align</Label>
        <Select
          value={el.textAlign}
          onValueChange={(value) => onUpdate({ textAlign: value as 'left' | 'center' | 'right' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Text Color</Label>
        <Input
          type="color"
          value={el.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="h-10 cursor-pointer"
        />
      </div>
      <div className="space-y-2">
        <Label>Background Color</Label>
        <Input
          type="color"
          value={el.backgroundColor}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="h-10 cursor-pointer"
        />
      </div>
    </>
  );

  const renderTickerProperties = (el: TickerElement) => (
    <>
      <div className="space-y-2">
        <Label>Ticker Text</Label>
        <Textarea
          value={el.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Enter scrolling text..."
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Speed: {el.speed}</Label>
        <Slider
          value={[el.speed]}
          onValueChange={([value]) => onUpdate({ speed: value })}
          min={1}
          max={10}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <Label>Font Size: {el.fontSize}px</Label>
        <Slider
          value={[el.fontSize]}
          onValueChange={([value]) => onUpdate({ fontSize: value })}
          min={12}
          max={100}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <Label>Text Color</Label>
        <Input
          type="color"
          value={el.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="h-10 cursor-pointer"
        />
      </div>
      <div className="space-y-2">
        <Label>Background Color</Label>
        <Input
          type="color"
          value={el.backgroundColor}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="h-10 cursor-pointer"
        />
      </div>
    </>
  );

  const renderVideoProperties = (el: VideoElement) => (
    <>
      <div className="space-y-2">
        <Label>Video URL</Label>
        <Input
          value={el.src}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="Paste video URL..."
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Auto Play</Label>
        <Switch
          checked={el.autoPlay}
          onCheckedChange={(checked) => onUpdate({ autoPlay: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Loop</Label>
        <Switch
          checked={el.loop}
          onCheckedChange={(checked) => onUpdate({ loop: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Muted</Label>
        <Switch
          checked={el.muted}
          onCheckedChange={(checked) => onUpdate({ muted: checked })}
        />
      </div>
    </>
  );

  const renderProperties = () => {
    switch (element.type) {
      case 'image':
        return renderImageProperties(element as ImageElement);
      case 'text':
        return renderTextProperties(element as TextElement);
      case 'ticker':
        return renderTickerProperties(element as TickerElement);
      case 'video':
        return renderVideoProperties(element as VideoElement);
      default:
        return <p className="text-sm text-muted-foreground">No properties available</p>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg capitalize">{element.type} Properties</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Position & Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(element.position.x)}
                onChange={(e) => onUpdate({ position: { ...element.position, x: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(element.position.y)}
                onChange={(e) => onUpdate({ position: { ...element.position, y: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={Math.round(element.size.width)}
                onChange={(e) => onUpdate({ size: { ...element.size, width: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={Math.round(element.size.height)}
                onChange={(e) => onUpdate({ size: { ...element.size, height: Number(e.target.value) } })}
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Type-specific properties */}
          {renderProperties()}

          <div className="h-px bg-border" />

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={onBringToFront}>
                <ArrowUp className="h-4 w-4 mr-1" /> Front
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={onSendToBack}>
                <ArrowDown className="h-4 w-4 mr-1" /> Back
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-1" /> Duplicate
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
