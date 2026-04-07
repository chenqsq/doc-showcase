import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LightboxState } from '../types';

interface ZoomLightboxProps {
  lightbox: LightboxState | null;
  onClose: () => void;
}

export function ZoomLightbox({ lightbox, onClose }: ZoomLightboxProps) {
  useEffect(() => {
    if (!lightbox) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightbox, onClose]);

  if (!lightbox) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-xl" role="dialog" aria-modal="true">
      <div className="grid h-[min(92vh,920px)] w-[min(100%,1320px)] grid-rows-[auto,minmax(0,1fr)] gap-4 rounded-[2rem] border border-border/70 bg-card/92 p-4 shadow-[var(--shadow-panel)]">
        <TransformWrapper minScale={0.8} maxScale={6} centerOnInit wheel={{ step: 0.15 }}>
          {({ resetTransform, setTransform, zoomIn, zoomOut }) => (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="grid gap-2">
                  <Badge variant="outline" className="w-fit">
                    沉浸查看
                  </Badge>
                  <h3 className="text-xl font-semibold text-foreground">{lightbox.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => resetTransform()}>
                    <RotateCcw className="h-4 w-4" />
                    适配
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setTransform(0, 0, 1)}>
                    100%
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setTransform(0, 0, 2)}>
                    200%
                  </Button>
                  <Button type="button" variant="secondary" size="icon" onClick={() => zoomOut()} aria-label="缩小">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="secondary" size="icon" onClick={() => zoomIn()} aria-label="放大">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                    关闭
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.7rem] bg-secondary/60">
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}
                >
                  <img className="max-h-[min(100%,760px)] max-w-[min(100%,1200px)] object-contain" src={lightbox.src} alt={lightbox.title} />
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
