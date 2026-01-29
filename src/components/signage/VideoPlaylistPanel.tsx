import { useState, useRef } from 'react';
import { VideoElement } from '@/types/signage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, Upload, Link, ChevronDown, Film, Settings2, GripVertical } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface VideoPlaylistPanelProps {
  element: VideoElement;
  onUpdate: (updates: Partial<VideoElement>) => void;
}

export function VideoPlaylistPanel({ element, onUpdate }: VideoPlaylistPanelProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadVideo, isUploading } = useImageUpload();

  // Get all videos - combine src with videos array for backwards compatibility
  const allVideos = element.videos?.length 
    ? element.videos 
    : element.src 
      ? [{ src: element.src }] 
      : [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (let i = 0; i < files.length; i++) {
      const url = await uploadVideo(files[i]);
      if (url) {
        const newVideos = [...allVideos, { src: url }];
        onUpdate({ 
          videos: newVideos,
          src: newVideos[0]?.src || ''
        });
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const newVideos = [...allVideos, { src: urlInput.trim() }];
    onUpdate({ 
      videos: newVideos,
      src: newVideos[0]?.src || ''
    });
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveVideo = (index: number) => {
    const newVideos = allVideos.filter((_, i) => i !== index);
    onUpdate({ 
      videos: newVideos,
      src: newVideos[0]?.src || ''
    });
  };

  return (
    <div className="space-y-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Videos ({allVideos.length})
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <Link className="h-4 w-4 mr-1" />
              URL
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />

          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter video URL..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              />
              <Button size="sm" onClick={handleAddUrl}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {allVideos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg group"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="w-16 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                    <video
                      src={video.src}
                      className="w-full h-full object-cover"
                      muted
                    />
                  </div>
                  <span className="flex-1 text-xs truncate">
                    Video {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemoveVideo(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {allVideos.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No videos added yet
            </div>
          )}

          {allVideos.length > 1 && (
            <p className="text-xs text-muted-foreground text-center">
              Videos will play one after another
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Playback
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">Auto Play</Label>
            <Switch
              checked={element.autoPlay}
              onCheckedChange={(checked) => onUpdate({ autoPlay: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">Loop {allVideos.length > 1 ? 'Playlist' : 'Video'}</Label>
            <Switch
              checked={element.loop}
              onCheckedChange={(checked) => onUpdate({ loop: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">Muted</Label>
            <Switch
              checked={element.muted}
              onCheckedChange={(checked) => onUpdate({ muted: checked })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
