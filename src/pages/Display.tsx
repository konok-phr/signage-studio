import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CanvasElement as CanvasElementType, SlideshowElement, ASPECT_RATIOS } from '@/types/signage';
import { cn } from '@/lib/utils';

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

export default function Display() {
  const { id } = useParams<{ id: string }>();
  const [elements, setElements] = useState<CanvasElementType[]>([]);
  const [ratio, setRatio] = useState('16:9');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentRatio = ASPECT_RATIOS.find(r => r.value === ratio) || ASPECT_RATIOS[0];

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        setError('No display ID provided');
        setLoading(false);
        return;
      }

      try {
        // Use the public view that excludes sensitive user_id field
        const { data, error: fetchError } = await supabase
          .from('signage_projects_public')
          .select('*')
          .eq('id', id)
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
      inset: 0,
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
        return element.src ? (
          <div style={style} className="overflow-hidden">
            <video
              src={element.src}
              className="w-full h-full object-cover"
              autoPlay={element.autoPlay}
              loop={element.loop}
              muted={element.muted}
              playsInline
            />
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

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden animate-fade-in"
      style={{ cursor: 'none' }}
    >
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
