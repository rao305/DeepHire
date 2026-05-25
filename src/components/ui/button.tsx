import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center text-xs font-mono tracking-wider uppercase transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terminal-green disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#00ff88] text-[#0a0e14] hover:bg-[#00ff88]/90 border border-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]',
        destructive: 'bg-[#ff4444]/10 text-terminal-red border border-terminal-red/30 hover:bg-[#ff4444]/20',
        outline: 'border border-[#27272a] bg-transparent hover:bg-[#1a1a1f] hover:border-[#3f3f46]',
        secondary: 'bg-[#1a1a1f] text-terminal-amber border border-[#27272a] hover:border-terminal-amber/30',
        ghost: 'hover:bg-[#1a1a1f] hover:text-terminal-green',
        link: 'text-terminal-green underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
