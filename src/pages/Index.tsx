import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Play, Settings, Tv2, ArrowRight } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadDisplay = async () => {
    if (!code.trim()) {
      toast.error('Please enter a display code');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('signage_projects')
        .select('id, is_published')
        .eq('publish_code', code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Invalid display code. Please check and try again.');
        return;
      }

      if (!data.is_published) {
        toast.error('This display is not published yet.');
        return;
      }

      // Navigate to fullscreen player
      navigate(`/display/${data.id}`);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load display');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Tv2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">SignageHub</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
          <Settings className="h-4 w-4" />
          Admin Panel
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Digital Signage Display
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter your display code to load your signage content on this screen
            </p>
          </div>

          {/* Display Monitor Mockup */}
          <div className="relative mx-auto max-w-2xl mb-12">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-8 border-slate-700 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="text-center space-y-4">
                  <Monitor className="h-20 w-20 text-primary/50 mx-auto" />
                  <div>
                    <p className="text-xl font-medium text-foreground/80">Ready to Display</p>
                    <p className="text-sm text-muted-foreground">Enter your code below</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Stand */}
            <div className="w-32 h-4 bg-slate-700 mx-auto rounded-b-lg" />
            <div className="w-48 h-2 bg-slate-600 mx-auto rounded-full mt-1" />
          </div>

          {/* Code Input Card */}
          <Card className="max-w-md mx-auto shadow-lg border-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-1">Enter Display Code</h2>
                  <p className="text-sm text-muted-foreground">
                    Get this code from your admin panel after publishing
                  </p>
                </div>
                
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  className="text-center text-2xl font-mono tracking-widest h-14 uppercase"
                  maxLength={8}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadDisplay()}
                />
                
                <Button 
                  onClick={handleLoadDisplay} 
                  className="w-full h-12 text-lg gap-2"
                  disabled={isLoading || !code.trim()}
                >
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Load Display
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Need to create or manage displays?
            </p>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              Go to Admin Panel
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        <p>Digital Signage Management System</p>
      </footer>
    </div>
  );
}
