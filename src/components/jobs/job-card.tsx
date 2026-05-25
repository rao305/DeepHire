import Link from 'next/link';
import { StatusBadge } from '../ui/status-badge';
import { Terminal } from 'lucide-react';

interface JobCardProps {
  job: any;
}

export function JobCard({ job }: JobCardProps) {
  const candidateCount = job._count?.candidates || 0;
  const createdDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block border border-[#1a1a1f] bg-[#0f1116] hover:border-terminal-green/30 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] group"
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-terminal-green flex-shrink-0" />
              <h3 className="text-sm font-mono text-[#e6edf3] truncate group-hover:text-terminal-green transition-colors">
                {job.title}
              </h3>
            </div>
            <div className="text-[10px] text-[#8b949e] font-mono tracking-wider">
              {createdDate.toUpperCase()}
            </div>
          </div>
          <StatusBadge status="complete" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-px bg-[#1a1a1f]">
          <div className="bg-[#0f1116] px-3 py-2">
            <div className="text-[10px] text-[#8b949e] font-mono mb-1">CANDIDATES</div>
            <div className="text-lg font-mono text-terminal-green tabular-nums">
              {candidateCount.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="bg-[#0f1116] px-3 py-2">
            <div className="text-[10px] text-[#8b949e] font-mono mb-1">STATUS</div>
            <div className="text-xs font-mono text-terminal-amber">ACTIVE</div>
          </div>
        </div>

        {/* Border decoration */}
        <div className="h-px bg-gradient-to-r from-transparent via-terminal-green/20 to-transparent" />
      </div>
    </Link>
  );
}
