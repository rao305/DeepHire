import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    pending: {
      bg: 'bg-[#27272a]',
      text: 'text-[#71717a]',
      border: 'border-[#3f3f46]',
      label: 'PENDING',
    },
    analyzing: {
      bg: 'bg-[#1e3a5f]/30',
      text: 'text-terminal-blue',
      border: 'border-terminal-blue/30',
      label: 'ANALYZING',
      pulse: true,
    },
    complete: {
      bg: 'bg-[#00ff88]/10',
      text: 'text-terminal-green',
      border: 'border-terminal-green/30',
      label: 'COMPLETE',
    },
    error: {
      bg: 'bg-[#ff4444]/10',
      text: 'text-terminal-red',
      border: 'border-terminal-red/30',
      label: 'ERROR',
    },
  };

  const variant = variants[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 border text-[10px] font-mono tracking-wider',
        variant.bg,
        variant.text,
        variant.border,
        className
      )}
    >
      <div
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant.bg.replace('/10', '').replace('/30', ''),
          variant.pulse && 'animate-pulse-green'
        )}
      />
      {variant.label}
    </div>
  );
}
