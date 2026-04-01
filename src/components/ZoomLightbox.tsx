import { useEffect } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
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
    <div className="lightbox-overlay" role="dialog" aria-modal="true">
      <div className="lightbox-shell">
        <TransformWrapper minScale={0.8} maxScale={6} centerOnInit wheel={{ step: 0.15 }}>
          {({ resetTransform, setTransform, zoomIn, zoomOut }) => (
            <>
              <div className="lightbox-toolbar">
                <div>
                  <div className="section-kicker">沉浸查看</div>
                  <h3>{lightbox.title}</h3>
                </div>
                <div className="lightbox-actions">
                  <button type="button" onClick={() => resetTransform()}>
                    Fit
                  </button>
                  <button type="button" onClick={() => setTransform(0, 0, 1)}>
                    100%
                  </button>
                  <button type="button" onClick={() => setTransform(0, 0, 2)}>
                    200%
                  </button>
                  <button type="button" onClick={() => zoomOut()}>
                    -
                  </button>
                  <button type="button" onClick={() => zoomIn()}>
                    +
                  </button>
                  <button type="button" className="accent-button" onClick={onClose}>
                    关闭
                  </button>
                </div>
              </div>
              <div className="lightbox-stage">
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}
                >
                  <img className="lightbox-image" src={lightbox.src} alt={lightbox.title} />
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
