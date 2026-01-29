import { useState, useRef } from 'react';
import { AudioElement } from '@/types/signage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Link, ChevronDown, Music, Settings2, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface AudioPanelProps {
  element: AudioElement;
  onUpdate: (updates: Partial<AudioElement>) => void;
}

export function AudioPanel({ element, onUpdate }: AudioPanelProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Audio must be less than 50MB');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be authenticated to upload');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('signage-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('signage-media')
        .getPublicUrl(filePath);

      onUpdate({ src: publicUrl });
      toast.success('Audio uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload audio');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onUpdate({ src: urlInput.trim() });
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Audio Source
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
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter audio URL..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              />
              <Button size="sm" onClick={handleAddUrl}>
                Add
              </Button>
            </div>
          )}

          {element.src && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Music className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Current Audio</span>
              </div>
              <audio 
                src={element.src} 
                controls 
                className="w-full h-8"
                style={{ height: '32px' }}
              />
            </div>
          )}

          {!element.src && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No audio added yet
            </div>
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
            <Label className="text-sm">Loop</Label>
            <Switch
              checked={element.loop}
              onCheckedChange={(checked) => onUpdate({ loop: checked })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Volume
          </span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Level</Label>
              <span className="text-xs text-muted-foreground">{Math.round(element.volume * 100)}%</span>
            </div>
            <Slider
              value={[element.volume * 100]}
              onValueChange={([value]) => onUpdate({ volume: value / 100 })}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
