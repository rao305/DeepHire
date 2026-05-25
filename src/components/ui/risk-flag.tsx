import { RiskFlag as RiskFlagType } from '@/types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskFlagProps {
  flag: RiskFlagType;
}

export function RiskFlag({ flag }: RiskFlagProps) {
  const config = {
    high: {
      icon: AlertTriangle,
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      iconBg: 'bg-red-500/20',
      label: 'High Risk',
    },
    medium: {
      icon: AlertCircle,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20',
      label: 'Medium Risk',
    },
    low: {
      icon: Info,
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20',
      text: 'text-gray-400',
      iconBg: 'bg-gray-500/20',
      label: 'Low Risk',
    },
  };

  const { icon: Icon, bg, border, text, iconBg, label } = config[flag.severity];

  const typeLabels: Record<string, string> = {
    jd_mirroring: 'JD Mirroring',
    unsupported_claim: 'Unsupported Claim',
    timeline_mismatch: 'Timeline Mismatch',
    inflated_scale: 'Inflated Scale',
    thin_evidence: 'Thin Evidence',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        bg,
        border
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('rounded-full p-2', iconBg)}>
          <Icon className={cn('h-4 w-4', text)} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-medium uppercase tracking-wider', text)}>
              {label}
            </span>
            <span className="text-xs text-[#71717a]">•</span>
            <span className="text-xs font-medium text-[#f5f5f5]">
              {typeLabels[flag.type] || flag.type}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-[#a1a1aa] leading-relaxed">
            {flag.description}
          </p>

          {/* Related Claim */}
          {flag.relatedClaim && (
            <div className="mt-3 rounded-md bg-[#0A0A0B] border border-[#27272a] p-3">
              <p className="text-xs text-[#71717a] mb-1 uppercase tracking-wider">
                Related Claim
              </p>
              <p className="text-xs text-[#a1a1aa] italic leading-relaxed">
                "{flag.relatedClaim}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
