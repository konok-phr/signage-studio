import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CanvasElement, ASPECT_RATIOS } from '@/types/signage';

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [ratio, setRatio] = useState(ASPECT_RATIOS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('signage_projects')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Project not found or not published');
          setLoading(false);
          return;
        }

        const projectElements = (data.elements as unknown as CanvasElement[]) || [];
        setElements(projectElements);
        
        const foundRatio = ASPECT_RATIOS.find(r => r.value === data.ratio);
        if (foundRatio) setRatio(foundRatio);
        
        // Initialize slideshow indices
        const initialSlideIndex: Record<string, number> = {};
        projectElements.forEach(el => {
          if (el.type === 'slideshow' && el.images.length > 0) {
            initialSlideIndex[el.id] = 0;
          }
        });
        setCurrentSlideIndex(initialSlideIndex);
        
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Slideshow timer
  useEffect(() => {
    const slideshowElements = elements.filter(el => el.type === 'slideshow' && el.images.length > 1);
    
    if (slideshowElements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => {
        const next = { ...prev };
        slideshowElements.forEach(el => {
          if (el.type === 'slideshow') {
            const currentIndex = prev[el.id] || 0;
            next[el.id] = (currentIndex + 1) % el.images.length;
          }
        });
        return next;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [elements]);

  const renderElement = (element: CanvasElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${(element.position.x / ratio.width) * 100}%`,
      top: `${(element.position.y / ratio.height) * 100}%`,
      width: `${(element.size.width / ratio.width) * 100}%`,
      height: `${(element.size.height / ratio.height) * 100}%`,
      zIndex: element.zIndex,
    };

    switch (element.type) {
      case 'image':
        return element.src ? (
          <div key={element.id} style={style}>
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
          <div key={element.id} style={style}>
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
            key={element.id}
            style={{
              ...style,
              fontSize: `${(element.fontSize / ratio.height) * 100}vh`,
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
            }}
          >
            {element.content}
          </div>
        );

      case 'ticker':
        return (
          <div
            key={element.id}
            style={{
              ...style,
              fontSize: `${(element.fontSize / ratio.height) * 100}vh`,
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
                animation: `marquee ${30 / element.speed}s linear infinite`,
              }}
            >
              {element.text}
            </div>
          </div>
        );

      case 'slideshow':
        const currentIndex = currentSlideIndex[element.id] || 0;
        const currentImage = element.images[currentIndex];
        return currentImage ? (
          <div key={element.id} style={style} className="overflow-hidden">
            <img
              src={currentImage.src}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      <div
        className="relative bg-white"
        style={{
          aspectRatio: `${ratio.width} / ${ratio.height}`,
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: ratio.width > ratio.height ? '100vw' : 'auto',
          height: ratio.width > ratio.height ? 'auto' : '100vh',
        }}
      >
        {elements.map(renderElement)}
      </div>
    </div>
  );
}
