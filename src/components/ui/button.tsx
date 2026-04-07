import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex touch-manipulation select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-[320ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px active:scale-[0.982] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-primary/92 active:bg-primary/88',
        secondary:
          'border border-border/70 bg-card/80 text-foreground shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-primary/38 hover:bg-card active:border-primary/30 active:bg-accent/72',
        ghost: 'text-foreground/80 hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        outline:
          'border border-border/70 bg-background/60 text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        subtle:
          'bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/82 active:bg-secondary/76'
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
