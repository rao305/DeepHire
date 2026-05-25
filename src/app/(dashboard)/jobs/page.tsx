'use client';

import { useQuery } from '@tanstack/react-query';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { JobCardSkeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Plus, Rocket, Terminal } from 'lucide-react';

async function fetchJobs() {
  const res = await fetch('/api/jobs');
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export default function JobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  return (
    <div className="min-h-screen p-8">
      {/* Terminal Header */}
      <div className="mb-12 border-l-2 border-terminal-green pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-6 h-6 text-terminal-green" />
          <h1 className="text-2xl font-mono text-terminal-green tracking-tight">
            ~/jobs
          </h1>
        </div>
        <p className="text-xs font-mono text-[#8b949e] tracking-wider">
          MANAGE OPEN POSITIONS AND EVALUATION CRITERIA
        </p>
      </div>

      {/* Action Bar */}
      <div className="mb-8 flex items-center justify-between border-t border-b border-[#1a1a1f] py-4">
        <div className="text-xs font-mono text-[#8b949e]">
          {isLoading ? (
            <span className="animate-pulse">LOADING...</span>
          ) : (
            <span>
              {jobs?.length || 0} ROLE{jobs?.length !== 1 ? 'S' : ''} CONFIGURED
            </span>
          )}
        </div>
        <Link href="/jobs/new">
          <Button size="sm">
            <Plus className="h-3 w-3 mr-2" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job: any, idx: number) => (
            <div
              key={job.id}
              style={{
                animation: `in 0.3s ease-out ${idx * 0.05}s both`,
              }}
            >
              <JobCard job={job} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#27272a]">
          <div className="mb-8 relative">
            <Rocket className="w-16 h-16 text-terminal-green opacity-20" />
            <div className="absolute inset-0 animate-ping opacity-10">
              <Rocket className="w-16 h-16 text-terminal-green" />
            </div>
          </div>
          <h3 className="text-sm font-mono text-terminal-green mb-2">
            NO ROLES CONFIGURED
          </h3>
          <p className="text-xs font-mono text-[#8b949e] mb-8 max-w-md text-center">
            Create your first role to start evaluating candidates with AI-powered
            evidence verification
          </p>
          <Link href="/jobs/new">
            <Button>
              <Plus className="h-3 w-3 mr-2" />
              Create First Role
            </Button>
          </Link>
        </div>
      )}

      {/* Footer Stats */}
      {!isLoading && jobs && jobs.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[#1a1a1f]">
          <div className="grid grid-cols-3 gap-px bg-[#1a1a1f] border border-[#1a1a1f]">
            <div className="bg-[#0a0e14] px-6 py-4">
              <div className="text-[10px] text-[#8b949e] font-mono mb-1">
                TOTAL ROLES
              </div>
              <div className="text-2xl font-mono text-terminal-green tabular-nums">
                {jobs.length.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="bg-[#0a0e14] px-6 py-4">
              <div className="text-[10px] text-[#8b949e] font-mono mb-1">
                ACTIVE
              </div>
              <div className="text-2xl font-mono text-terminal-amber tabular-nums">
                {jobs.length.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="bg-[#0a0e14] px-6 py-4">
              <div className="text-[10px] text-[#8b949e] font-mono mb-1">
                TOTAL CANDIDATES
              </div>
              <div className="text-2xl font-mono text-[#8b949e] tabular-nums">
                {jobs
                  .reduce((sum: number, job: any) => sum + (job._count?.candidates || 0), 0)
                  .toString()
                  .padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
