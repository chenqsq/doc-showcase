import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  useRef,
  useState
} from 'react';
import { cn } from '@/lib/utils';

type StealthScrollAxis = 'x' | 'y' | 'both';

interface StealthScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  axis?: StealthScrollAxis;
}

const EDGE_ACTIVATION_SIZE = 12;

export const StealthScrollArea = forwardRef<HTMLDivElement, StealthScrollAreaProps>(function StealthScrollArea(
  { axis = 'y', className, onBlurCapture, onFocusCapture, onMouseLeave, onMouseMove, ...props },
  forwardedRef
) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  const setActiveState = (next: boolean) => {
    setActive((current) => (current === next ? current : next));
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const node = elementRef.current;
    if (node) {
      const rect = node.getBoundingClientRect();
      const hasVerticalOverflow = node.scrollHeight - node.clientHeight > 1;
      const hasHorizontalOverflow = node.scrollWidth - node.clientWidth > 1;
      const nearRightEdge =
        hasVerticalOverflow &&
        event.clientX >= rect.right - EDGE_ACTIVATION_SIZE &&
        event.clientX <= rect.right + 1 &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      const nearBottomEdge =
        hasHorizontalOverflow &&
        event.clientY >= rect.bottom - EDGE_ACTIVATION_SIZE &&
        event.clientY <= rect.bottom + 1 &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right;

      const nextActive =
        axis === 'both' ? nearRightEdge || nearBottomEdge : axis === 'x' ? nearBottomEdge : nearRightEdge;

      setActiveState(nextActive);
    }

    onMouseMove?.(event);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    setActiveState(false);
    onMouseLeave?.(event);
  };

  return (
    <div
      {...props}
      ref={(node) => {
        elementRef.current = node;

        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
          return;
        }

        if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      className={cn('stealth-scrollbar', className)}
      data-stealth-active={active ? 'true' : 'false'}
      onBlurCapture={(event) => {
        setActiveState(false);
        onBlurCapture?.(event);
      }}
      onFocusCapture={(event) => {
        setActiveState(true);
        onFocusCapture?.(event);
      }}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    />
  );
});
