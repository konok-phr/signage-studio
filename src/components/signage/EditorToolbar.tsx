import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Globe, LayoutTemplate, Trash2, Monitor, Smartphone, Square, Ratio, 
  Copy, CheckCheck, Home, Eye 
} from 'lucide-react';
import { ASPECT_RATIOS } from '@/types/signage';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface EditorToolbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  ratio: string;
  onRatioChange: (ratio: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onOpenTemplates: () => void;
  onOpenPreview: () => void;
  onClearCanvas: () => void;
  isSaving: boolean;
  isPublished: boolean;
  publishCode?: string | null;
}

const ratioIcons = {
  '16:9': Monitor,
  '9:16': Smartphone,
  '1:1': Square,
  '4:3': Ratio,
};

export function EditorToolbar({
  projectName,
  onProjectNameChange,
  ratio,
  onRatioChange,
  onSave,
  onPublish,
  onOpenTemplates,
  onOpenPreview,
  onClearCanvas,
  isSaving,
  isPublished,
  publishCode,
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (publishCode) {
      await navigator.clipboard.writeText(publishCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border-b shadow-sm">
      {/* Logo / Brand */}
      <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-9 w-9">
        <Home className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Monitor className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold hidden sm:inline">Signage Builder</span>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Project Name */}
      <Input
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        className="w-48 h-9 text-sm font-medium bg-transparent border-transparent hover:border-input focus:border-input transition-colors"
        placeholder="Project name..."
      />

      <Separator orientation="vertical" className="h-6" />
      
      {/* Ratio Selection */}
      <div className="flex items-center gap-1">
        {ASPECT_RATIOS.map((r) => {
          const Icon = ratioIcons[r.value as keyof typeof ratioIcons] || Ratio;
          return (
            <Button
              key={r.value}
              variant={ratio === r.value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-9 px-3 gap-1.5"
              onClick={() => onRatioChange(r.value)}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline text-xs">{r.label}</span>
            </Button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Published Code Display */}
      {isPublished && publishCode && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
          <span className="text-xs text-green-600 font-medium">Code:</span>
          <span className="font-mono font-bold text-green-700">{publishCode}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={handleCopyCode}
          >
            {copied ? (
              <CheckCheck className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-green-600" />
            )}
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 gap-2" onClick={onOpenPreview}>
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Preview</span>
        </Button>
        
        <Button variant="outline" size="sm" className="h-9 gap-2" onClick={onOpenTemplates}>
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground" onClick={onClearCanvas}>
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
        
        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" className="h-9 gap-2" onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
        </Button>
        
        <Button size="sm" className="h-9 gap-2" onClick={onPublish} disabled={isSaving}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{isPublished ? 'Update' : 'Publish'}</span>
        </Button>
      </div>
    </div>
  );
}
