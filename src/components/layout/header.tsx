'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  actions?: ReactNode;
  className?: string;
}

export function Header({ breadcrumbs, title, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 border-b border-[#27272a] bg-[#0A0A0B]/95 backdrop-blur-sm',
        className
      )}
    >
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="flex items-center gap-2 mb-2"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <li key={index} className="flex items-center gap-2">
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="text-xs text-[#71717a] hover:text-[#2563EB] transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          'text-xs',
                          isLast ? 'text-[#a1a1aa]' : 'text-[#71717a]'
                        )}
                      >
                        {crumb.label}
                      </span>
                    )}

                    {!isLast && (
                      <ChevronRight
                        className="h-3 w-3 text-[#71717a]"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Title & Actions */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#f5f5f5] tracking-tight">
            {title}
          </h1>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
