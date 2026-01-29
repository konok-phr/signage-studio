import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CanvasElement as CanvasElementType, SlideshowElement, VideoElement, AudioElement, ASPECT_RATIOS } from '@/types/signage';
import { cn } from '@/lib/utils';
import { Maximize, Minimize } from 'lucide-react';

// Slideshow component with transitions
function SlideshowDisplay({ element }: { element: SlideshowElement }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (!element.autoPlay || element.images.length <= 1) return;
    
    const currentImage = element.images[currentIndex];
    const duration = (currentImage?.duration || 5) * 1000;
    
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % element.images.length);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [currentIndex, element.images, element.autoPlay]);
  
  if (element.images.length === 0) return null;
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {element.images.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
    </div>
  );
}

// Video playlist component
function VideoPlaylistDisplay({ element }: { element: VideoElement }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Get all videos - combine src with videos array for backwards compatibility
  const allVideos = element.videos?.length 
    ? element.videos 
    : element.src 
      ? [{ src: element.src }] 
      : [];

  const handleVideoEnded = useCallback(() => {
    if (allVideos.length > 1) {
      // Move to next video
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= allVideos.length) {
          // If loop is enabled, go back to first video
          return element.loop ? 0 : prev;
        }
        return next;
      });
    }
  }, [allVideos.length, element.loop]);

  // When index changes, play the new video
  useEffect(() => {
    if (videoRef.current && element.autoPlay) {
      videoRef.current.play().catch(console.error);
    }
  }, [currentIndex, element.autoPlay]);

  if (allVideos.length === 0) return null;

  const currentVideo = allVideos[currentIndex];
  // For single video, use the element's loop setting directly
  const shouldLoop = allVideos.length === 1 && element.loop;

  return (
    <video
      ref={videoRef}
      key={currentIndex}
      src={currentVideo.src}
      className="w-full h-full object-cover"
      autoPlay={element.autoPlay}
      loop={shouldLoop}
      muted={element.muted}
      playsInline
      onEnded={handleVideoEnded}
    />
  );
}

// Background audio component
function BackgroundAudio({ element }: { element: AudioElement }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = element.volume;
    }
  }, [element.volume]);

  if (!element.src) return null;

  return (
    <audio
      ref={audioRef}
      src={element.src}
      autoPlay={element.autoPlay}
      loop={element.loop}
      style={{ display: 'none' }}
    />
  );
}

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
            <img
              src={element.src}
              alt={element.alt || ''}
              className="w-full h-full"
              style={{ objectFit: element.objectFit || 'cover' }}
            />
          </div>
        ) : null;

      case 'video':
        const hasVideos = element.src || (element.videos && element.videos.length > 0);
        return hasVideos ? (
          <div style={style} className="overflow-hidden">
            <VideoPlaylistDisplay element={element} />
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
        const animationDuration = 20 / element.speed;
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
        {elements.map((element, index) => (
          <div
            key={element.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${0.3 + index * 0.1}s`,
              animationFillMode: 'both',
            }}
          >
            {renderElement(element)}
          </div>
        ))}
      </div>
    </div>
  );
}
