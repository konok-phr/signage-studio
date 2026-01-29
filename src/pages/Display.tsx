import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CanvasElement as CanvasElementType, AudioElement, ASPECT_RATIOS } from '@/types/signage';
import { cn } from '@/lib/utils';
import { getTickerDurationSeconds, getTickerStartOffsetSeconds } from '@/lib/ticker';
import { Maximize, Minimize } from 'lucide-react';
import { VideoPlayer } from '@/components/signage/display/VideoPlayer';
import { ImageDisplay } from '@/components/signage/display/ImageDisplay';
import { SlideshowDisplay } from '@/components/signage/display/SlideshowDisplay';
import { BackgroundAudio } from '@/components/signage/display/BackgroundAudio';

export default function Display() {
  const { id } = useParams<{ id: string }>();
  const [elements, setElements] = useState<CanvasElementType[]>([]);
  const [ratio, setRatio] = useState('16:9');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentRatio = ASPECT_RATIOS.find(r => r.value === ratio) || ASPECT_RATIOS[0];

  // Handle mouse movement to show/hide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);


  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        setError('No display ID provided');
        setLoading(false);
        return;
      }

      try {
        // Use RPC function that requires project ID for access (prevents enumeration)
        const { data, error: fetchError } = await supabase
          .rpc('get_published_project_by_id', { project_id: id })
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Display not found or not published');
          setLoading(false);
          return;
        }

        setElements(data.elements as unknown as CanvasElementType[]);
        setRatio(data.ratio);
      } catch (err) {
        console.error('Load error:', err);
        setError('Failed to load display');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const renderElement = (element: CanvasElementType) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${(element.position.x / currentRatio.width) * 100}%`,
      top: `${(element.position.y / currentRatio.height) * 100}%`,
      width: `${(element.size.width / currentRatio.width) * 100}%`,
      height: `${(element.size.height / currentRatio.height) * 100}%`,
      zIndex: element.zIndex,
    };

    switch (element.type) {
      case 'image':
        return element.src ? (
          <div style={style} className="overflow-hidden">
            <ImageDisplay element={element} />
          </div>
        ) : null;

      case 'video':
        const hasVideos = element.src || (element.videos && element.videos.length > 0);
        return hasVideos ? (
          <div style={style} className="overflow-hidden">
            <VideoPlayer element={element} />
          </div>
        ) : null;

      case 'text':
        return (
          <div
            style={{
              ...style,
              fontSize: `${(element.fontSize / currentRatio.height) * 100}vh`,
              fontWeight: element.fontWeight,
              color: element.color,
              backgroundColor: element.backgroundColor,
              textAlign: element.textAlign,
              fontFamily: element.fontFamily,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: '0.5%',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.2,
            }}
          >
            {element.content}
          </div>
        );

      case 'ticker':
        const animationDuration = getTickerDurationSeconds(element.speed);
        const startOffset = getTickerStartOffsetSeconds(animationDuration);
        return (
          <div
            style={{
              ...style,
              fontSize: `${(element.fontSize / currentRatio.height) * 100}vh`,
              color: element.color,
              backgroundColor: element.backgroundColor,
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <div 
              className="whitespace-nowrap"
              style={{
                animation: `marquee ${animationDuration}s linear infinite`,
                animationDelay: `-${startOffset}s`,
                willChange: 'transform',
              }}
            >
              {element.text}
            </div>
          </div>
        );

      case 'slideshow':
        return (
          <div style={style} className="overflow-hidden">
            <SlideshowDisplay element={element} />
          </div>
        );

      case 'audio':
        // Audio elements don't render visually, they just play audio
        return null;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="text-white text-xl font-medium">Loading display...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">{error}</p>
          <p className="text-muted-foreground">Please check your display code and try again.</p>
        </div>
      </div>
    );
  }

  // Filter audio elements for background playback
  const audioElements = elements.filter((el): el is AudioElement => el.type === 'audio');

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden animate-fade-in"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={handleMouseMove}
    >
      {/* Background Audio Elements */}
      {audioElements.map((audioEl) => (
        <BackgroundAudio key={audioEl.id} element={audioEl} />
      ))}

      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        className={cn(
          "absolute top-4 right-4 z-50 p-3 rounded-lg bg-black/70 hover:bg-black/90 text-white transition-all duration-300",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <Minimize className="h-5 w-5" />
        ) : (
          <Maximize className="h-5 w-5" />
        )}
      </button>

      <div
        className="relative bg-background w-full h-full animate-scale-in"
        style={{
          aspectRatio: `${currentRatio.width}/${currentRatio.height}`,
          maxWidth: '100vw',
          maxHeight: '100vh',
          animationDelay: '0.2s',
          animationFillMode: 'both',
        }}
      >
        {elements.map((element, index) => {
          const isTicker = element.type === 'ticker';
          const animationDelay = isTicker ? 0 : 0.3 + index * 0.1;
          return (
          <div
            key={element.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${animationDelay}s`,
              animationFillMode: 'both',
            }}
          >
            {renderElement(element)}
          </div>
          );
        })}
      </div>
    </div>
  );
}
