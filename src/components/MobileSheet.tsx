import { X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface MobileSheetProps {
  children: ReactNode;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right' | 'bottom';
  title: string;
}

const sheetSideClassNames = {
  left: 'inset-y-4 left-4 h-auto w-[min(92vw,26rem)]',
  right: 'inset-y-4 right-4 h-auto w-[min(92vw,26rem)]',
  bottom: 'inset-x-4 bottom-4 max-h-[min(82vh,42rem)]'
} as const;

const sheetHiddenTransformClassNames = {
  left: '-translate-x-5',
  right: 'translate-x-5',
  bottom: 'translate-y-5'
} as const;

export function MobileSheet({
  children,
  description,
  open,
  onOpenChange,
  side = 'left',
  title
}: MobileSheetProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMounted(false), 160);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenChange, open]);

  if (typeof document === 'undefined') {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 min-[1024px]:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="关闭移动导航遮罩"
        className={cn(
          'absolute inset-0 bg-background/60 transition-opacity duration-150',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onOpenChange(false)}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute flex flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[var(--shadow-panel)] transition-[transform,opacity,visibility] duration-150 ease-out',
          sheetSideClassNames[side],
          open ? 'visible translate-x-0 translate-y-0 opacity-100' : 'invisible opacity-0',
          !open ? sheetHiddenTransformClassNames[side] : ''
        )}
        data-perf-id="mobile-sheet"
      >
        <div className="border-b border-border/60 px-5 py-5 pr-14">
          <div className="text-xl font-semibold tracking-tight text-foreground">{title}</div>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <button
          type="button"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
          data-perf-id="mobile-sheet-close"
          aria-label="关闭"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="stealth-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </section>
    </div>,
    document.body
  );
}
