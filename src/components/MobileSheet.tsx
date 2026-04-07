import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileSheetProps {
  children: ReactNode;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right' | 'bottom';
  title: string;
}

export function MobileSheet({
  children,
  description,
  open,
  onOpenChange,
  side = 'left',
  title
}: MobileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b border-border/60 px-[var(--mobile-content-gutter)] py-2.5 md:px-5 md:py-5">
          <SheetTitle className="text-[0.96rem] leading-tight md:text-xl">{title}</SheetTitle>
          {description ? (
            <SheetDescription className="text-[0.78rem] leading-5 md:text-sm md:leading-6">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="stealth-scrollbar min-h-0 flex-1 overflow-y-auto px-[var(--mobile-content-gutter)] py-2.5 [contain:layout_paint_style] md:px-5">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
