import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/46 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-[160ms] data-[state=closed]:duration-[140ms] md:bg-background/70 md:backdrop-blur-md md:data-[state=open]:duration-[220ms] md:data-[state=closed]:duration-[180ms]',
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 flex transform-gpu flex-col gap-0 border border-border/70 bg-background/96 p-0 shadow-none will-change-transform transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-[220ms] data-[state=closed]:duration-[180ms] md:bg-card/95 md:shadow-[var(--shadow-panel)] md:backdrop-blur-xl md:data-[state=open]:duration-[260ms] md:data-[state=closed]:duration-[220ms]',
  {
    variants: {
      side: {
        top: 'inset-x-3 top-3 rounded-[var(--surface-panel-radius)] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top md:inset-x-4 md:top-4',
        bottom:
          'inset-x-3 bottom-3 rounded-[var(--surface-panel-radius)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom md:inset-x-4 md:bottom-4',
        left:
          'inset-y-0 left-0 h-dvh w-[var(--mobile-drawer-width-compact)] rounded-none border-l-0 border-t-0 border-b-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:inset-y-3 md:left-3 md:h-[calc(100dvh-1.5rem)] md:rounded-r-[var(--surface-hero-radius)] md:border md:border-border/70',
        right:
          'inset-y-0 right-0 h-dvh w-[var(--mobile-drawer-width-compact)] rounded-none border-r-0 border-t-0 border-b-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right md:inset-y-3 md:right-3 md:h-[calc(100dvh-1.5rem)] md:rounded-l-[var(--surface-hero-radius)] md:border md:border-border/70'
      }
    },
    defaultVariants: {
      side: 'right'
    }
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-3 top-3 rounded-[var(--surface-control-radius)] p-2 text-muted-foreground transition-[background-color,color,transform,box-shadow] duration-[220ms] hover:bg-accent hover:text-accent-foreground hover:shadow-[var(--shadow-soft)] active:scale-[0.96] md:right-4 md:top-4">
        <X className="h-4 w-4" />
        <span className="sr-only">关闭</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 pr-10', className)} {...props} />
);

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-xl font-semibold tracking-tight', className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger
};
