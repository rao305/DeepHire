'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
}

export function ScoreRing({ score, size = 'md', label, sublabel }: ScoreRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizes = {
    sm: { container: 'h-20 w-20', stroke: 8, text: 'text-lg' },
    md: { container: 'h-28 w-28', stroke: 10, text: 'text-2xl' },
    lg: { container: 'h-36 w-36', stroke: 12, text: 'text-3xl' },
  };

  const config = sizes[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = mounted
    ? circumference - (score * circumference)
    : circumference;

  const getColor = (score: number) => {
    if (score > 0.7) return '#22c55e'; // green
    if (score >= 0.4) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const color = getColor(score);
  const percentage = Math.round(score * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn('relative', config.container)}>
        <svg
          className="transform -rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Score: ${percentage}%`}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#27272a"
            strokeWidth={config.stroke}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth={config.stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px currentColor)',
              opacity: 0.9,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn('font-mono font-bold tabular-nums', config.text)}
            style={{ color }}
          >
            {percentage}
          </span>
        </div>
      </div>
      {(label || sublabel) && (
        <div className="flex flex-col items-center gap-0.5">
          {label && (
            <p className="text-sm font-medium text-[#f5f5f5]">{label}</p>
          )}
          {sublabel && (
            <p className="text-xs text-[#71717a]">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
