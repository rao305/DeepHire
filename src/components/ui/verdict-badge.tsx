import { ClaimVerdict } from '@/types';
import { Check, AlertTriangle, HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerdictBadgeProps {
  verdict: ClaimVerdict;
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const config = {
    SUPPORTED: {
      icon: Check,
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      label: 'Supported',
    },
    WEAKLY_SUPPORTED: {
      icon: AlertTriangle,
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      label: 'Weakly Supported',
    },
    UNVERIFIED: {
      icon: HelpCircle,
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20',
      text: 'text-gray-400',
      label: 'Unverified',
    },
    CONTRADICTED: {
      icon: X,
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      label: 'Contradicted',
    },
  };

  const { icon: Icon, bg, border, text, label } = config[verdict];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1',
        bg,
        border,
        text,
        className
      )}
      role="status"
      aria-label={`Verdict: ${label}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
