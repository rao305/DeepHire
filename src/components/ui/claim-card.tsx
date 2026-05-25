'use client';

import { useState } from 'react';
import { ExtractedClaim, JgmentResult, EvidenceSnippet } from '@/types';
import { VerdictBadge } from './verdict-badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClaimCardProps {
  claim: ExtractedClaim;
  judgment?: JgmentResult;
  showEvidence?: boolean;
  evidence?: EvidenceSnippet[];
}

export function ClaimCard({ claim, judgment, showEvidence = false, evidence = [] }: ClaimCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeColors: Record<string, string> = {
    skill: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    project: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    scale: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    ownership: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    deployment: 'bg-green-500/10 border-green-500/20 text-green-400',
    leadership: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    outcome: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    timeline: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    employment: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  };

  const relevanceWidth = `${claim.jobRelevance * 100}%`;

  return (
    <div
      className="rounded-lg border border-[#27272a] bg-[#1a1a1b] p-4 transition-colors hover:border-[#3a3a3c]"
      role="article"
      aria-label="Candidate claim"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="flex-1 text-sm text-[#f5f5f5] leading-relaxed">{claim.text}</p>
        <div className="flex items-center gap-2 shrink-0">
          {judgment && <VerdictBadge verdict={judgment.verdict} />}
          <div
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
              typeColors[claim.type] || 'bg-gray-500/10 border-gray-500/20 text-gray-400'
            )}
          >
            {claim.type}
          </div>
        </div>
      </div>

      {/* Relevance Score Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-[#71717a] mb-1.5">
          <span>Job Relevance</span>
          <span className="font-mono tabular-nums">{Math.round(claim.jobRelevance * 100)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#27272a] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#3b82f6] transition-all duration-700 ease-out"
            style={{ width: relevanceWidth }}
            role="progressbar"
            aria-valuenow={claim.jobRelevance * 100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Judgment Details */}
      {judgment && (
        <div className="space-y-2 pt-3 border-t border-[#27272a]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#71717a]">Confidence</span>
            <span className="font-mono tabular-nums text-[#f5f5f5]">
              {Math.round(judgment.confidence * 100)}%
            </span>
          </div>
          {judgment.reasoning && (
            <p className="text-xs text-[#a1a1aa] leading-relaxed italic">
              {judgment.reasoning}
            </p>
          )}
        </div>
      )}

      {/* Evidence Section */}
      {showEvidence && evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#27272a]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-xs text-[#71717a] hover:text-[#f5f5f5] transition-colors"
            aria-expanded={isExpanded}
            aria-controls="evidence-snippets"
          >
            <span className="font-medium">
              Evidence ({evidence.length} {evidence.length === 1 ? 'snippet' : 'snippets'})
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {isExpanded && (
            <div
              id="evidence-snippets"
              className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200"
            >
              {evidence.map((snippet, idx) => (
                <div
                  key={idx}
                  className="rounded-md bg-[#0A0A0B] border border-[#27272a] p-3"
                >
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    {snippet.text}
                  </p>
                  {snippet.context && (
                    <p className="text-xs text-[#71717a] mt-2 italic">
                      Context: {snippet.context}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[#71717a]">
                      Relevance: <span className="font-mono tabular-nums">{Math.round(snippet.relevance * 100)}%</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
