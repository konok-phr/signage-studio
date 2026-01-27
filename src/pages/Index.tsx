import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Play, Settings, Tv2, Sparkles } from 'lucide-react';

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

      navigate(`/display/${data.id}`);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load display');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
            <Tv2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-white">SignageHub</span>
            <p className="text-xs text-slate-400">Digital Display System</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')} 
          className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Admin Panel
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Digital Signage Made Simple</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              Power Your
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent"> Displays</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Enter your unique display code to instantly load your custom signage content
            </p>
          </div>

          {/* Monitor Display with Input Inside */}
          <div className="relative mx-auto max-w-2xl">
            {/* Monitor Frame */}
            <div className="relative">
              {/* Screen bezel */}
              <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl p-3 shadow-2xl">
                {/* Inner bezel */}
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-1">
                  {/* Screen */}
                  <div className="aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden relative">
                    {/* Screen content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      {/* Decorative lines */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                      </div>
                      
                      {/* Scan lines effect */}
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
                      
                      {/* Content */}
                      <div className="relative z-10 w-full max-w-sm space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                            <Play className="h-8 w-8 text-primary" />
                          </div>
                          <h2 className="text-xl font-semibold text-white mb-2">Enter Display Code</h2>
                          <p className="text-sm text-slate-500">6-character code from your admin panel</p>
                        </div>
                        
                        <div className="space-y-4">
                          <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            className="text-center text-3xl font-mono tracking-[0.5em] h-16 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/20"
                            maxLength={6}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoadDisplay()}
                          />
                          
                          <Button 
                            onClick={handleLoadDisplay} 
                            className="w-full h-12 text-lg gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                            disabled={isLoading || !code.trim()}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Loading...
                              </div>
                            ) : (
                              <>
                                <Play className="h-5 w-5" />
                                Launch Display
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Screen reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Monitor Stand */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-12 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-lg" />
                <div className="w-40 h-3 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full shadow-lg" />
              </div>
            </div>
            
            {/* Ambient glow under monitor */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/20 blur-3xl rounded-full" />
          </div>

          {/* Bottom hint */}
          <div className="mt-16 text-center">
            <p className="text-sm text-slate-500">
              Need to create displays? 
              <Button 
                variant="link" 
                onClick={() => navigate('/admin')}
                className="text-primary hover:text-primary/80 px-1"
              >
                Open Admin Panel →
              </Button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-slate-600">Digital Signage Management System</p>
      </footer>
    </div>
  );
}