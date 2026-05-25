import { RankedShippedWork } from '@/types';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShippedWorkCardProps {
  item: RankedShippedWork;
  rank: number;
}

export function ShippedWorkCard({ item, rank }: ShippedWorkCardProps) {
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    if (rank === 2) return 'bg-gray-400/20 border-gray-400/30 text-gray-300';
    if (rank === 3) return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
    return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  };

  const getTechColor = (tech: string) => {
    const lowerTech = tech.toLowerCase();
    // Frontend
    if (lowerTech.includes('react') || lowerTech.includes('vue') || lowerTech.includes('angular'))
      return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    // Backend
    if (lowerTech.includes('node') || lowerTech.includes('express') || lowerTech.includes('fastapi'))
      return 'bg-green-500/10 border-green-500/20 text-green-400';
    // Database
    if (lowerTech.includes('postgres') || lowerTech.includes('mongo') || lowerTech.includes('redis'))
      return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    // Infrastructure
    if (lowerTech.includes('docker') || lowerTech.includes('kubernetes') || lowerTech.includes('aws'))
      return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    // Language
    if (lowerTech.includes('typescript') || lowerTech.includes('python') || lowerTech.includes('go'))
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    // Default
    return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
  };

  return (
    <div
      className="group relative rounded-lg border border-[#27272a] bg-[#1a1a1b] p-5 transition-all hover:border-[#3a3a3c] hover:shadow-lg hover:shadow-[#2563EB]/5"
      role="article"
      aria-label={`Shipped work: ${item.title}`}
    >
      {/* Rank Badge */}
      <div
        className={cn(
          'absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-sm font-bold',
          getRankBadgeColor(rank)
        )}
        aria-label={`Rank: ${rank}`}
      >
        {rank}
      </div>

      {/* Title & Description */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#f5f5f5] mb-2 pr-6">
          {item.title}
        </h3>
        <p className="text-sm text-[#a1a1aa] leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Impressiveness Narrative */}
      {item.impressivenessNarrative && (
        <p className="text-xs text-[#71717a] italic mb-4 leading-relaxed">
          {item.impressivenessNarrative}
        </p>
      )}

      {/* Technology Pills */}
      {item.technologies && item.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.technologies.map((tech) => (
            <div
              key={tech}
              className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium font-mono',
                getTechColor(tech)
              )}
            >
              {tech}
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#27272a]">
        {item.hasLiveDemo && item.demoUrl && (
          <a
            href={item.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
            aria-label="View live demo (opens in new tab)"
          >
            <span>Live Demo</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
        {item.githubUrl && (
          <a
            href={item.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#2563EB] transition-colors"
            aria-label="View on GitHub (opens in new tab)"
          >
            <span>View Source</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
        {item.sourceUrl && !item.githubUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#2563EB] transition-colors"
            aria-label="View project (opens in new tab)"
          >
            <span>View Project</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Recency indicator */}
      {item.recency && (
        <div className="mt-2 text-xs text-[#71717a]">
          {item.recency}
        </div>
      )}
    </div>
  );
}
