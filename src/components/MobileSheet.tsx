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
        <SheetHeader className="border-b border-border/60 px-5 py-5">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="stealth-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
