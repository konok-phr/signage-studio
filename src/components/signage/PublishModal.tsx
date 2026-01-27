import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Link2, Hash, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publishCode: string;
  projectId: string;
}

export function PublishModal({ open, onOpenChange, publishCode, projectId }: PublishModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const displayUrl = `${window.location.origin}/display/${projectId}`;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(publishCode);
    setCopiedCode(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(displayUrl);
    setCopiedLink(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(displayUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            Published Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Display Code */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4 text-primary" />
              Display Code
            </Label>
            <p className="text-xs text-muted-foreground">
              Enter this code on the home screen to load your display
            </p>
            <div className="flex gap-2">
              <Input
                value={publishCode}
                readOnly
                className="font-mono text-xl font-bold tracking-widest text-center bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="shrink-0"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Direct Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Link2 className="h-4 w-4 text-primary" />
              Direct Link
            </Label>
            <p className="text-xs text-muted-foreground">
              Share this link directly to open the display
            </p>
            <div className="flex gap-2">
              <Input
                value={displayUrl}
                readOnly
                className="text-sm bg-muted truncate"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenLink}
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
