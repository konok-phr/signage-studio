import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Play, Settings, Tv2, Sparkles, LogIn, FolderOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, loading } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadDisplay = async () => {
    if (!code.trim()) {
      toast.error('Please enter a display code');
      return;
    }

    setIsLoading(true);
    try {
      // Use the public view that excludes sensitive user_id field
      const { data, error } = await supabase
        .from('signage_projects_public')
        .select('id')
        .eq('publish_code', code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Invalid display code. Please check and try again.');
        return;
      }

      // View already filters for published projects, so no additional check needed

      navigate(`/display/${data.id}`);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load display');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
            <Tv2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-xl text-foreground">SignageHub</span>
            <p className="text-xs text-muted-foreground">Digital Display System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/projects')} 
                    className="gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    My Projects
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => navigate('/admin')} 
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    New Project
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')} 
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </>
          )}
        </div>
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
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              Power Your
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"> Displays</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Enter your unique display code to instantly load your custom signage content
            </p>
          </div>

          {/* Monitor Display with Input Inside */}
          <div className="relative mx-auto max-w-2xl">
            {/* Monitor Frame */}
            <div className="relative">
              {/* Screen bezel */}
              <div className="bg-gradient-to-b from-muted to-muted/80 rounded-3xl p-3 shadow-2xl border border-border">
                {/* Inner bezel */}
                <div className="bg-gradient-to-b from-card to-card/90 rounded-2xl p-1 border border-border/50">
                  {/* Screen */}
                  <div className="aspect-video bg-gradient-to-br from-card via-muted/50 to-card rounded-xl overflow-hidden relative border border-border/30">
                    {/* Screen content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      {/* Decorative lines */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                      </div>
                      
                      {/* Scan lines effect */}
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.03)_50%)] bg-[length:100%_4px] pointer-events-none" />
                      
                      {/* Content */}
                      <div className="relative z-10 w-full max-w-sm space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 border border-primary/30">
                            <Play className="h-8 w-8 text-primary" />
                          </div>
                          <h2 className="text-xl font-semibold text-foreground mb-2">Enter Display Code</h2>
                          <p className="text-sm text-muted-foreground">6-character code from your admin panel</p>
                        </div>
                        
                        <div className="space-y-4">
                          <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            className="text-center text-2xl font-mono tracking-[0.4em] h-16 bg-background/80 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20"
                            maxLength={6}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoadDisplay()}
                          />
                          
                          <Button 
                            onClick={handleLoadDisplay} 
                            className="w-full h-12 text-lg gap-2 shadow-lg shadow-primary/25"
                            disabled={isLoading || !code.trim()}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
                <div className="w-20 h-12 bg-gradient-to-b from-muted to-muted/80 rounded-b-lg border-x border-b border-border" />
                <div className="w-40 h-3 bg-gradient-to-b from-muted/80 to-muted rounded-full shadow-lg border border-border" />
              </div>
            </div>
            
            {/* Ambient glow under monitor */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/10 blur-3xl rounded-full" />
          </div>

          {/* Bottom hint */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
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
        <p className="text-sm text-muted-foreground">Digital Signage Management System</p>
      </footer>
    </div>
  );
}