import { cn } from '@/lib/utils';

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  return (
    <div className={cn('flex-1 space-y-6 p-6', className)}>
      {children}
    </div>
  );
}
