'use client';

import { ScoreRing } from './score-ring';
import { VerdictBadge } from './verdict-badge';
import { ClaimCard } from './claim-card';
import { ShippedWorkCard } from './shipped-work-card';
import { RiskFlag } from './risk-flag';
import { ProgressSteps, ProgressStep } from './progress-steps';
import {
  ExtractedClaim,
  JgmentResult,
  RankedShippedWork,
  RiskFlag as RiskFlagType,
  EvidenceSnippet,
} from '@/types';

/**
 * ComponentShowcase demonstrates all UI components in the DeepHire design system.
 * This serves as both a visual reference and a testing ground for the component library.
 */
export function ComponentShowcase() {
  // Sample data
  const sampleClaim: ExtractedClaim = {
    id: '1',
    type: 'skill',
    text: 'Led a team of 5 engineers to build a microservices architecture handling 10M+ requests per day',
    keywords: ['team', 'microservices', 'scale'],
    category: 'leadership',
    jobRelevance: 0.85,
    priority: 1,
    verificationStrategy: ['github_api', 'linkedin'],
  };

  const sampleJudgment: JgmentResult = {
    verdict: 'SUPPORTED',
    confidence: 0.92,
    reasoning: 'GitHub contributions show consistent team collaboration and extensive microservices work. Architecture decisions documented in PRs align with claimed scale.',
  };

  const sampleEvidence: EvidenceSnippet[] = [
    {
      text: 'Implemented distributed tracing across 15 microservices using OpenTelemetry',
      relevance: 0.95,
      supportsClaim: true,
      context: 'From architecture decision record in main repository',
    },
    {
      text: 'Team grew from 2 to 5 engineers during my tenure as tech lead',
      relevance: 0.88,
      supportsClaim: true,
    },
  ];

  const sampleShippedWork: RankedShippedWork = {
    rank: 1,
    title: 'Real-time Analytics Dashboard',
    description: 'Built a real-time analytics platform processing 50K events/sec with sub-second latency. Implemented custom aggregation engine and WebSocket-based updates.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    sourceUrl: 'https://github.com/example/analytics',
    githubUrl: 'https://github.com/example/analytics',
    demoUrl: 'https://demo.example.com',
    hasLiveDemo: true,
    relevanceToRole: 0.94,
    technicalDepth: 0.89,
    recency: '6 months ago',
    evidenceScreenshots: [],
    impressivenessNarrative: 'Demonstrates strong full-stack capabilities and production-scale system design. The custom aggregation engine shows deep understanding of performance optimization.',
  };

  const sampleRiskFlag: RiskFlagType = {
    type: 'timeline_mismatch',
    severity: 'medium',
    description: 'Candidate claims 3 years of React experience, but GitHub shows first React commit 18 months ago. May indicate private work or resume exaggeration.',
    relatedClaim: 'Expert in React with 3+ years of production experience',
  };

  const sampleSteps: ProgressStep[] = [
    { id: '1', label: 'Parse job description', status: 'completed', detail: 'Extracted 12 key requirements' },
    { id: '2', label: 'Extract candidate claims', status: 'completed', detail: 'Found 24 verifiable claims' },
    { id: '3', label: 'Gather GitHub evidence', status: 'running', detail: 'Analyzing 15 repositories...' },
    { id: '4', label: 'Verify LinkedIn data', status: 'pending' },
    { id: '5', label: 'Generate brief', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#f5f5f5] mb-2">DeepHire Component Library</h1>
          <p className="text-[#71717a]">Data-forward dark professional design system</p>
        </div>

        {/* Score Rings */}
        <section>
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">Score Rings</h2>
          <div className="flex items-end gap-8">
            <ScoreRing score={0.92} size="sm" label="Technical" sublabel="Excellent" />
            <ScoreRing score={0.67} size="md" label="Leadership" sublabel="Good" />
            <ScoreRing score={0.31} size="lg" label="Communication" sublabel="Needs Work" />
          </div>
        </section>

        {/* Verdict Badges */}
        <section>
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">Verdict Badges</h2>
          <div className="flex items-center gap-3">
            <VerdictBadge verdict="SUPPORTED" />
            <VerdictBadge verdict="WEAKLY_SUPPORTED" />
            <VerdictBadge verdict="UNVERIFIED" />
            <VerdictBadge verdict="CONTRADICTED" />
          </div>
        </section>

        {/* Claim Cards */}
        <section>
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">Claim Cards</h2>
          <div className="space-y-4">
            <ClaimCard
              claim={sampleClaim}
              judgment={sampleJudgment}
              showEvidence={true}
              evidence={sampleEvidence}
            />
            <ClaimCard
              claim={{
                ...sampleClaim,
                text: 'Contributed to open-source projects with 10K+ stars',
                type: 'project',
                jobRelevance: 0.45,
              }}
            />
          </div>
        </section>

        {/* Shipped Work Cards */}
        <section>
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">Shipped Work Cards</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ShippedWorkCard item={sampleShippedWork} rank={1} />
            <ShippedWorkCard
              item={{
                ...sampleShippedWork,
                rank: 2,
                title: 'E-commerce Checkout Flow',
                description: 'Redesigned checkout process reducing cart abandonment by 34%. Implemented A/B testing framework.',
                technologies: ['Vue', 'TypeScript', 'Express', 'MongoDB'],
                hasLiveDemo: false,
                impressivenessNarrative: 'Shows strong product thinking and measurable business impact.',
              }}
              rank={2}
            />
          </div>
        </section>

        {/* Risk Flags */}
        <section>
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">Risk Flags</h2>
          <div className="space-y-4">
            <RiskFlag flag={sampleRiskFlag} />
            <RiskFlag
              flag={{
                type: 'unsupported_claim',
                severity: 'high',
                description: 'Candidate claims to have "architected a system serving 100M users" but evidence shows contributions to a project with ~10K active users.',
                relatedClaim: 'Architected scalable systems for 100M+ users',
              }}
            />
          </div>
        </section>

        {/* Progress Steps */}
        <section>
          <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">Progress Steps</h2>
          <div className="max-w-md">
            <ProgressSteps steps={sampleSteps} />
          </div>
        </section>
      </div>
    </div>
  );
}
