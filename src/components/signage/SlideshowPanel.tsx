import { useState, useRef } from 'react';
import { SlideshowElement } from '@/types/signage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, GripVertical, Upload, Link, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface SlideshowPanelProps {
  element: SlideshowElement;
  onUpdate: (updates: Partial<SlideshowElement>) => void;
}

export function SlideshowPanel({ element, onUpdate }: SlideshowPanelProps) {
  const [urlInput, setUrlInput] = useState('');
  const [addMode, setAddMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploadMultipleImages, isUploading, uploadProgress } = useImageUpload();

  const handleAddFromUrl = () => {
    if (!urlInput.trim()) return;
    
    const newImages = [...element.images, { src: urlInput.trim(), duration: 5 }];
    onUpdate({ images: newImages });
    setUrlInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls = await uploadMultipleImages(files);
    if (urls.length > 0) {
      const newImages = [...element.images, ...urls.map(src => ({ src, duration: 5 }))];
      onUpdate({ images: newImages });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = element.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  const handleUpdateDuration = (index: number, duration: number) => {
    const newImages = [...element.images];
    newImages[index] = { ...newImages[index], duration };
    onUpdate({ images: newImages });
  };

  const handleMoveImage = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= element.images.length) return;
    
    const newImages = [...element.images];
    [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
    onUpdate({ images: newImages });
  };

  return (
    <div className="space-y-4">
      {/* Add Image Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Add Images</Label>
        
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={addMode === 'upload' ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setAddMode('upload')}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload
          </Button>
          <Button
            variant={addMode === 'url' ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setAddMode('url')}
          >
            <Link className="h-3.5 w-3.5 mr-1.5" />
            URL
          </Button>
        </div>

        {addMode === 'upload' ? (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              className="w-full h-20 border-dashed flex flex-col gap-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Click to upload images</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddFromUrl()}
            />
            <Button size="icon" onClick={handleAddFromUrl} disabled={!urlInput.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Images List */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Slides ({element.images.length})
        </Label>
        
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-2">
            {element.images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No images added yet
              </div>
            ) : (
              element.images.map((img, index) => (
                <Card key={index} className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleMoveImage(index, 'up')}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="h-12 w-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img
                        src={img.src}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Duration</Label>
                        <Input
                          type="number"
                          value={img.duration}
                          onChange={(e) => handleUpdateDuration(index, Number(e.target.value))}
                          className="h-7 w-16 text-xs"
                          min={1}
                          max={60}
                        />
                        <span className="text-xs text-muted-foreground">sec</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Transition Settings */}
      <div className="space-y-3 pt-2 border-t">
        <div className="space-y-2">
          <Label>Transition Style</Label>
          <Select
            value={element.transition}
            onValueChange={(value) => onUpdate({ transition: value as 'fade' | 'slide' | 'none' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Auto Play</Label>
          <Switch
            checked={element.autoPlay}
            onCheckedChange={(checked) => onUpdate({ autoPlay: checked })}
          />
        </div>
      </div>
    </div>
  );
}
