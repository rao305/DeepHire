'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useOrganization } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Briefcase, Users, Settings, Menu } from 'lucide-react';
import { useState } from 'react';

const routes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { label: 'Candidates', icon: Users, href: '/candidates' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex h-screen flex-col border-r border-[#27272a] bg-[#0A0A0B] transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Main navigation"
      >
        {/* Logo & Org */}
        <div className="flex items-center justify-between p-5 border-b border-[#27272a]">
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold font-mono tracking-tight text-[#f5f5f5]">
                DeepHire
              </h1>
              {organization && (
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-xs text-[#71717a] truncate">
                    {organization.name}
                  </p>
                  <div className="inline-flex items-center rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 px-1.5 py-0.5">
                    <span className="text-[10px] font-medium text-[#2563EB] uppercase tracking-wider">
                      Pro
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-[#1a1a1b] transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-4 w-4 text-[#71717a]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1" role="navigation">
          {routes.map((route) => {
            const isActive =
              pathname === route.href || pathname?.startsWith(route.href + '/');
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#1a1a1b] text-[#f5f5f5] border-l-2 border-[#2563EB] shadow-sm'
                    : 'text-[#a1a1aa] hover:bg-[#1a1a1b] hover:text-[#f5f5f5]',
                  isCollapsed && 'justify-center'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <route.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span>{route.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div
            className={cn(
              'p-4 border-t border-[#27272a]',
              isCollapsed && 'p-2'
            )}
          >
            <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 shrink-0">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User avatar'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-[#2563EB]">
                    {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-medium text-[#f5f5f5] truncate">
                    {user.fullName || 'User'}
                  </p>
                  <p className="text-xs text-[#71717a] truncate">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar - Placeholder for future implementation */}
      <div className="md:hidden">
        {/* Mobile navigation would go here */}
      </div>
    </>
  );
}
