import { useState, useRef } from 'react';
import { ImageElement, VideoElement } from '@/types/signage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, RotateCcw, ZoomIn, Move, Crop } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageCropPanelProps {
  element: ImageElement | VideoElement;
  onUpdate: (updates: Partial<ImageElement | VideoElement>) => void;
}

export function ImageCropPanel({ element, onUpdate }: ImageCropPanelProps) {
  const [urlInput, setUrlInput] = useState(element.src || '');
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploadVideo, isUploading, uploadProgress } = useImageUpload();

  const isImage = element.type === 'image';
  const imageElement = element as ImageElement;

  const handleUrlChange = () => {
    if (urlInput.trim()) {
      onUpdate({ src: urlInput.trim() });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use appropriate upload function based on element type
    const url = isImage ? await uploadImage(file) : await uploadVideo(file);
    if (url) {
      onUpdate({ src: url });
      setUrlInput(url);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Source Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{isImage ? 'Image' : 'Video'} Source</Label>
        
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={sourceMode === 'upload' ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setSourceMode('upload')}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload
          </Button>
          <Button
            variant={sourceMode === 'url' ? 'secondary' : 'ghost'}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setSourceMode('url')}
          >
            <Link className="h-3.5 w-3.5 mr-1.5" />
            URL
          </Button>
        </div>

        {sourceMode === 'upload' ? (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={isImage ? 'image/*' : 'video/*'}
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              className="w-full h-24 border-dashed flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </>
              ) : element.src ? (
                <>
                  {isImage ? (
                    <div className="h-12 w-12 rounded overflow-hidden">
                      <img src={element.src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <video src={element.src} className="h-12 w-20 rounded object-cover" />
                  )}
                  <span className="text-xs text-muted-foreground">Click to replace</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload {isImage ? 'image' : 'video'}
                  </span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={`Paste ${isImage ? 'image' : 'video'} URL...`}
              onBlur={handleUrlChange}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlChange()}
            />
            {element.src && (
              <div className="h-20 bg-muted rounded overflow-hidden">
                {isImage ? (
                  <img src={element.src} alt="" className="w-full h-full object-contain" />
                ) : (
                  <video src={element.src} className="w-full h-full object-contain" controls />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Display Options for Images */}
      {isImage && (
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Crop className="h-4 w-4" />
            Display Options
          </Label>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Fit Mode</Label>
            <Select
              value={imageElement.objectFit || 'cover'}
              onValueChange={(value) => onUpdate({ objectFit: value as 'cover' | 'contain' | 'fill' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-primary rounded-sm" />
                    Cover (Fill & Crop)
                  </div>
                </SelectItem>
                <SelectItem value="contain">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 border border-primary rounded-sm flex items-center justify-center">
                      <div className="w-2 h-1.5 bg-primary" />
                    </div>
                    Contain (Fit Inside)
                  </div>
                </SelectItem>
                <SelectItem value="fill">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-primary/50 rounded-sm" />
                    Fill (Stretch)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visual Preview */}
          {element.src && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Preview</Label>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border">
                <img
                  src={element.src}
                  alt=""
                  className="w-full h-full"
                  style={{ objectFit: imageElement.objectFit || 'cover' }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
