import { Save, Share2, LayoutTemplate, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RatioSelector } from './RatioSelector';

interface EditorToolbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  ratio: string;
  onRatioChange: (ratio: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onOpenTemplates: () => void;
  onClearCanvas: () => void;
  isSaving: boolean;
  isPublished: boolean;
}

export function EditorToolbar({
  projectName,
  onProjectNameChange,
  ratio,
  onRatioChange,
  onSave,
  onPublish,
  onOpenTemplates,
  onClearCanvas,
  isSaving,
  isPublished,
}: EditorToolbarProps) {
  return (
    <div className="h-14 border-b bg-card px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="w-48 font-medium"
          placeholder="Project name..."
        />
        
        <RatioSelector value={ratio} onChange={onRatioChange} />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenTemplates}>
          <LayoutTemplate className="h-4 w-4 mr-1" />
          Templates
        </Button>
        
        <Button variant="outline" size="sm" onClick={onClearCanvas}>
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>

        <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <Button size="sm" onClick={onPublish}>
          <Share2 className="h-4 w-4 mr-1" />
          {isPublished ? 'Update' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
