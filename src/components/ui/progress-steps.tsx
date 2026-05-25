'use client';

import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  detail?: string;
}

interface ProgressStepsProps {
  steps: ProgressStep[];
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="space-y-1" role="list" aria-label="Progress steps">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} role="listitem">
            <div className="flex items-start gap-4">
              {/* Status Indicator (square, terminal-style) */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center border transition-all',
                    {
                      'border-[#27272a] bg-[#0f1116]': step.status === 'pending',
                      'border-terminal-blue bg-terminal-blue/10':
                        step.status === 'running',
                      'border-terminal-green bg-terminal-green/10':
                        step.status === 'completed',
                      'border-terminal-red bg-terminal-red/10':
                        step.status === 'error',
                    }
                  )}
                  aria-label={`Step ${index + 1}: ${step.status}`}
                >
                  {step.status === 'pending' && (
                    <div className="h-1.5 w-1.5 bg-[#3f3f46]" />
                  )}
                  {step.status === 'running' && (
                    <Loader2
                      className="h-3.5 w-3.5 text-terminal-blue animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {step.status === 'completed' && (
                    <Check
                      className="h-3.5 w-3.5 text-terminal-green"
                      aria-hidden="true"
                    />
                  )}
                  {step.status === 'error' && (
                    <X
                      className="h-3.5 w-3.5 text-terminal-red"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {!isLast && (
                  <div
                    className={cn('w-px h-10 mt-1 transition-colors', {
                      'bg-[#27272a]': step.status === 'pending',
                      'bg-terminal-blue/40': step.status === 'running',
                      'bg-terminal-green/40': step.status === 'completed',
                      'bg-terminal-red/40': step.status === 'error',
                    })}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                <div
                  className={cn(
                    'text-xs font-mono tracking-wider uppercase transition-colors',
                    {
                      'text-[#3f3f46]': step.status === 'pending',
                      'text-terminal-blue': step.status === 'running',
                      'text-terminal-green': step.status === 'completed',
                      'text-terminal-red': step.status === 'error',
                    }
                  )}
                >
                  {step.label}
                  {step.status === 'running' && (
                    <span className="ml-2 text-[10px] text-terminal-blue/70 animate-pulse">
                      [RUNNING]
                    </span>
                  )}
                </div>

                {step.detail && (
                  <div className="mt-1.5 text-[11px] font-mono text-[#8b949e] leading-relaxed">
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
