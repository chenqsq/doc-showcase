import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-11 items-center justify-center rounded-full border border-border/60 bg-secondary/70 p-1 text-muted-foreground transition-[background-color,border-color,box-shadow] duration-[220ms] ease-out',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-[200ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 hover:bg-background/62 hover:text-foreground active:translate-y-px active:scale-[0.982] active:bg-background/78 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:-translate-y-px data-[state=active]:bg-primary/18 data-[state=active]:text-foreground data-[state=active]:ring-1 data-[state=active]:ring-primary/32 data-[state=active]:shadow-[0_12px_24px_rgba(48,88,167,0.2)]',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 focus-visible:outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
