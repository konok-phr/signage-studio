'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tv, ArrowRight, Layout, Share2, Monitor } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadDisplay = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      toast.error('Please enter a display code');
      return;
    }

    if (trimmedCode.length !== 6) {
      toast.error('Display code must be 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/by-code/${trimmedCode}`);
      if (!response.ok) {
        toast.error('Display not found. Please check the code and try again.');
        return;
      }
      const project = await response.json();
      router.push(`/display/${project.id}`);
    } catch (error) {
      toast.error('Failed to load display');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadDisplay();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Digital Signage</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/editor">
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Create Stunning
            <span className="text-primary block">Digital Signage</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Design, publish, and display beautiful content on any screen.
            Perfect for retail, hospitality, corporate, and events.
          </p>

          {/* Display Code Input */}
          <div className="max-w-md mx-auto mt-12">
            <div className="relative">
              <div className="bg-card border rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-center mb-4">
                  <Monitor className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter a 6-character code to view a display
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    onKeyDown={handleKeyDown}
                    className="text-center text-lg font-mono tracking-widest uppercase"
                    maxLength={6}
                  />
                  <Button onClick={handleLoadDisplay} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Go'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-card border">
              <Layout className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Drag & Drop Editor</h3>
              <p className="text-sm text-muted-foreground">
                Create layouts with images, videos, text, and slideshows
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border">
              <Share2 className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Easy Publishing</h3>
              <p className="text-sm text-muted-foreground">
                Share with a simple 6-character code or direct link
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border">
              <Monitor className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Any Screen</h3>
              <p className="text-sm text-muted-foreground">
                Works on Smart TVs, kiosks, tablets, and web browsers
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Digital Signage Builder - Self-Hosted Edition</p>
        </div>
      </footer>
    </div>
  );
}
