'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ScoreRing } from '@/components/ui/score-ring';
import { ShippedWorkCard } from '@/components/ui/shipped-work-card';
import { ClaimCard } from '@/components/ui/claim-card';
import { RiskFlag } from '@/components/ui/risk-flag';
import { EvidenceViewer } from '@/components/ui/evidence-viewer';
import { ChevronDown, ChevronUp, Copy, Check, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateBrief, ExtractedClaim, JgmentResult, RankedShippedWork, InterviewQuestion } from '@/types';

export default function CandidateBriefPage() {
  const params = useParams();
  const candidateId = params.candidateId as string;

  const [brief, setBrief] = useState<CandidateBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'brief' | 'evidence'>('brief');
  const [atsNoteCopied, setAtsNoteCopied] = useState(false);
  const [atsNoteExpanded, setAtsNoteExpanded] = useState(false);
  const [weakClaimsExpanded, setWeakClaimsExpanded] = useState(false);
  const [questionsCopied, setQuestionsCopied] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState<'advance' | 'hold' | 'reject' | null>(null);

  // Fetch brief data
  useEffect(() => {
    async function fetchBrief() {
      try {
        const response = await fetch(`/api/candidates/${candidateId}/brief`);
        if (!response.ok) throw new Error('Failed to fetch brief');
        const data = await response.json();
        setBrief(data);
      } catch (error) {
        console.error('Error fetching brief:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrief();
  }, [candidateId]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading]);

  const handleCopyAtsNote = async () => {
    if (!brief) return;
    const atsNote = generateAtsNote(brief);
    await navigator.clipboard.writeText(atsNote);
    setAtsNoteCopied(true);
    setTimeout(() => setAtsNoteCopied(false), 2000);
  };

  const handleCopyQuestions = async () => {
    if (!brief) return;
    const questionText = brief.interviewQuestions
      .map((q, i) => `${i + 1}. ${q.question}\n   Purpose: ${q.purpose}\n   Follow-ups:\n   ${q.followUpProbes.map(p => `   • ${p}`).join('\n')}`)
      .join('\n\n');
    await navigator.clipboard.writeText(questionText);
    setQuestionsCopied(true);
    setTimeout(() => setQuestionsCopied(false), 2000);
  };

  const handleStatusChange = async (status: 'advanced' | 'hold' | 'rejected') => {
    try {
      await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setShowConfirmDialog(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  if (loading) {
    return <BriefSkeleton />;
  }

  if (!brief) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="headline text-4xl mb-4">Brief Not Found</h1>
          <p className="text-[#6b7280]">Unable to load candidate brief. Please try again.</p>
        </div>
      </div>
    );
  }

  const githubUsername = brief.candidateId;
  const avatarUrl = `https://github.com/${githubUsername}.png`;

  const getScoreLabel = (score: number): string => {
    if (score >= 0.8) return 'Strong';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Weak';
  };

  const rankedWork: RankedShippedWork[] = brief.shippedWork
    .slice(0, 3)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
      impressivenessNarrative: `Demonstrates ${item.technicalDepth > 0.7 ? 'exceptional' : 'solid'} technical depth with real-world impact.`,
    }));

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Tab Navigation */}
      <div className="border-b-2 border-[#e5e5e0] bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('brief')}
              className={cn(
                'relative py-4 px-2 font-serif font-semibold text-lg transition-colors',
                activeTab === 'brief' ? 'text-teal' : 'text-[#6b7280] hover:text-[#1a1a1a]'
              )}
            >
              Brief
              {activeTab === 'brief' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={cn(
                'relative py-4 px-2 font-serif font-semibold text-lg transition-colors',
                activeTab === 'evidence' ? 'text-teal' : 'text-[#6b7280] hover:text-[#1a1a1a]'
              )}
            >
              Evidence
              {activeTab === 'evidence' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />
              )}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'brief' ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* SECTION 1: Candidate Header */}
          <header
            id="header"
            data-animate-section
            className={cn(
              'mb-16 opacity-0 transition-all duration-700',
              visibleSections.has('header') && 'opacity-100 translate-y-0'
            )}
          >
            <div className="flex items-start gap-8 mb-10">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={avatarUrl}
                    alt={`${brief.candidateName}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brief.candidateName)}&size=128&background=0d7377&color=fff&bold=true`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-teal text-white text-xs font-mono font-bold px-3 py-1 rounded-full shadow-lg">
                  {Math.round(brief.fitScore * 100)}%
                </div>
              </div>

              {/* Name & Role */}
              <div className="flex-1">
                <h1 className="headline text-6xl mb-3 text-[#0a0a0a]">
                  {brief.candidateName}
                </h1>
                <p className="text-xl text-[#6b7280] font-serif italic mb-6">
                  Analyzing for: <span className="text-teal font-semibold not-italic">{brief.roleTitle}</span>
                </p>

                {/* Score Rings */}
                <div className="flex gap-6 flex-wrap">
                  <ScoreRing
                    score={brief.fitScore}
                    size="lg"
                    label="Fit Score"
                    sublabel={getScoreLabel(brief.fitScore)}
                  />
                  <ScoreRing
                    score={brief.evidenceScore}
                    size="md"
                    label="Evidence"
                    sublabel={getScoreLabel(brief.evidenceScore)}
                  />
                  <ScoreRing
                    score={brief.shippedWorkScore}
                    size="md"
                    label="Shipped Work"
                    sublabel={getScoreLabel(brief.shippedWorkScore)}
                  />
                  <ScoreRing
                    score={brief.confidenceScore}
                    size="md"
                    label="Confidence"
                    sublabel={getScoreLabel(brief.confidenceScore)}
                  />
                </div>
              </div>
            </div>

            {/* Brief Title */}
            <div className="bg-gradient-to-r from-teal/5 to-transparent border-l-4 border-teal pl-6 pr-4 py-6 mb-6">
              <h2 className="text-2xl font-serif font-semibold text-[#1a1a1a] leading-relaxed">
                Strong technical background with proven delivery track record.
              </h2>
            </div>

            {/* ATS Note */}
            <div className="border-2 border-[#e5e5e0] rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setAtsNoteExpanded(!atsNoteExpanded)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#fafaf8] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-teal" />
                  <span className="font-serif font-semibold text-lg">ATS Note</span>
                </div>
                {atsNoteExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#6b7280]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                )}
              </button>

              {atsNoteExpanded && (
                <div className="px-6 pb-6 border-t-2 border-[#e5e5e0] pt-4">
                  <pre className="text-sm text-[#374151] whitespace-pre-wrap font-sans leading-relaxed bg-[#fafaf8] p-4 rounded-lg border border-[#e5e5e0]">
                    {generateAtsNote(brief)}
                  </pre>
                  <button
                    onClick={handleCopyAtsNote}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-md hover:bg-[#0a5f62] transition-colors font-medium text-sm"
                  >
                    {atsNoteCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy ATS Note
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_35%] gap-12">
            {/* Left Column */}
            <div className="space-y-16">
              {/* SECTION 2: Best Shipped Work */}
              <section
                id="shipped-work"
                data-animate-section
                className={cn(
                  'opacity-0 transition-all duration-700',
                  visibleSections.has('shipped-work') && 'opacity-100'
                )}
              >
                <div className="ink-bleed pt-8">
                  <h2 className="headline text-4xl mb-8 flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    Best Shipped Work
                  </h2>
                </div>

                <div className="space-y-8">
                  {rankedWork.map((item) => (
                    <div key={item.rank} className="space-y-4">
                      <ShippedWorkCard item={item} rank={item.rank} />

                      {item.evidenceScreenshots && item.evidenceScreenshots.length > 0 && (
                        <div className="ml-4 pl-6 border-l-2 border-[#e5e5e0] space-y-3">
                          <p className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider">Evidence</p>
                          <div className="flex gap-2 flex-wrap">
                            {item.evidenceScreenshots.slice(0, 3).map((screenshot, idx) => (
                              <button
                                key={idx}
                                className="w-24 h-24 rounded-md overflow-hidden border-2 border-[#e5e5e0] hover:border-teal transition-colors"
                                onClick={() => window.open(screenshot, '_blank')}
                              >
                                <img
                                  src={screenshot}
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION 3: Verified Signals */}
              <section
                id="verified-claims"
                data-animate-section
                className={cn(
                  'opacity-0 transition-all duration-700',
                  visibleSections.has('verified-claims') && 'opacity-100'
                )}
              >
                <div className="ink-bleed pt-8">
                  <h2 className="headline text-4xl mb-8 flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    Verified Signals
                    <span className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-bold font-mono">
                      {brief.verifiedClaims.length}
                    </span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {brief.verifiedClaims.map((claim, idx) => {
                    const claimData: ExtractedClaim = {
                      id: `verified-${idx}`,
                      type: 'skill',
                      text: claim.claimText,
                      keywords: [],
                      category: '',
                      jobRelevance: 0.9,
                      priority: 1,
                      verificationStrategy: [],
                    };

                    const judgment: JgmentResult = {
                      verdict: claim.verdict,
                      confidence: claim.confidence,
                      reasoning: claim.summary,
                    };

                    return (
                      <ClaimCard
                        key={idx}
                        claim={claimData}
                        judgment={judgment}
                        showEvidence={false}
                      />
                    );
                  })}
                </div>
              </section>

              {/* SECTION 4: Needs Verification */}
              {brief.weakClaims.length > 0 && (
                <section
                  id="weak-claims"
                  data-animate-section
                  className={cn(
                    'opacity-0 transition-all duration-700',
                    visibleSections.has('weak-claims') && 'opacity-100'
                  )}
                >
                  <div className="ink-bleed pt-8">
                    <button
                      onClick={() => setWeakClaimsExpanded(!weakClaimsExpanded)}
                      className="w-full flex items-center justify-between group"
                    >
                      <h2 className="headline text-4xl mb-8 flex items-center gap-3">
                        <span className="text-3xl">⚠️</span>
                        Needs Verification
                        <span className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold font-mono">
                          {brief.weakClaims.length}
                        </span>
                      </h2>
                      {weakClaimsExpanded ? (
                        <ChevronUp className="w-6 h-6 text-[#6b7280] group-hover:text-[#1a1a1a] transition-colors" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-[#6b7280] group-hover:text-[#1a1a1a] transition-colors" />
                      )}
                    </button>
                  </div>

                  {weakClaimsExpanded && (
                    <div className="space-y-4">
                      {brief.weakClaims.map((claim, idx) => (
                        <div
                          key={idx}
                          className="border-2 border-[#e5e5e0] rounded-lg p-5 bg-white hover:border-amber/30 transition-colors"
                        >
                          <p className="text-[#1a1a1a] font-medium mb-2">{claim.claimText}</p>
                          <p className="text-sm text-[#6b7280] mb-3">{claim.reason}</p>
                          <p className="text-sm text-[#374151] italic">
                            <span className="font-semibold not-italic">Follow-up: </span>
                            {claim.followUpSuggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-8">
              {/* SECTION 5: Risk Flags */}
              <section
                id="risk-flags"
                data-animate-section
                className={cn(
                  'opacity-0 transition-all duration-700 sticky top-24',
                  visibleSections.has('risk-flags') && 'opacity-100'
                )}
              >
                <h3 className="headline text-3xl mb-6 flex items-center gap-2">
                  <span className="text-2xl">🚩</span>
                  Risk Flags
                </h3>

                {brief.risks.length === 0 ? (
                  <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                    <p className="text-green-700 font-semibold flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      No significant risks detected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {brief.risks
                      .sort((a, b) => {
                        const severityOrder = { high: 0, medium: 1, low: 2 };
                        return severityOrder[a.severity] - severityOrder[b.severity];
                      })
                      .map((risk, idx) => (
                        <RiskFlag key={idx} flag={risk} />
                      ))}
                  </div>
                )}
              </section>

              {/* SECTION 6: Interview Questions */}
              <section
                id="interview-questions"
                data-animate-section
                className={cn(
                  'opacity-0 transition-all duration-700',
                  visibleSections.has('interview-questions') && 'opacity-100'
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="headline text-3xl flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    Interview Questions
                  </h3>
                  <button
                    onClick={handleCopyQuestions}
                    className="text-xs text-teal hover:text-[#0a5f62] font-medium flex items-center gap-1"
                  >
                    {questionsCopied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy All
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {brief.interviewQuestions.map((q, idx) => (
                    <InterviewQuestionCard key={idx} question={q} index={idx + 1} />
                  ))}
                </div>
              </section>

              {/* SECTION 7: Actions */}
              <section
                id="actions"
                className="sticky bottom-6 bg-white border-2 border-[#e5e5e0] rounded-lg p-6 shadow-xl"
              >
                <h3 className="font-serif font-semibold text-xl mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowConfirmDialog('advance')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
                  >
                    <span>✓</span>
                    Advance
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog('hold')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber text-white rounded-md hover:bg-amber-600 transition-colors font-semibold"
                  >
                    <span>⏸</span>
                    Hold
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog('reject')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
                  >
                    <span>✗</span>
                    Reject
                  </button>
                  <div className="pt-3 border-t-2 border-[#e5e5e0] space-y-2">
                    <button
                      onClick={handleExportPdf}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#e5e5e0] text-[#1a1a1a] rounded-md hover:bg-[#fafaf8] transition-colors font-medium text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                    <button
                      onClick={handleCopyAtsNote}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#e5e5e0] text-[#1a1a1a] rounded-md hover:bg-[#fafaf8] transition-colors font-medium text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy ATS Note
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <EvidenceViewer evidence={brief.evidencePackets.flatMap((p) => p.evidence)} />
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          action={showConfirmDialog}
          onConfirm={() => {
            if (showConfirmDialog === 'advance') handleStatusChange('advanced');
            if (showConfirmDialog === 'hold') handleStatusChange('hold');
            if (showConfirmDialog === 'reject') handleStatusChange('rejected');
          }}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header,
          nav,
          aside,
          #actions,
          button {
            display: none !important;
          }
          section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

function InterviewQuestionCard({ question, index }: { question: InterviewQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-[#e5e5e0] rounded-lg p-5 bg-white hover:border-teal/30 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold font-mono">
          {index}
        </span>
        <p className="flex-1 font-semibold text-[#1a1a1a] leading-relaxed">{question.question}</p>
      </div>
      <p className="text-sm text-[#6b7280] mb-3 ml-10">{question.purpose}</p>

      {question.followUpProbes.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-10 text-xs text-teal hover:text-[#0a5f62] font-medium flex items-center gap-1"
          >
            {expanded ? 'Hide' : 'Show'} follow-ups
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {expanded && (
            <ul className="mt-3 ml-10 space-y-2 text-sm text-[#374151]">
              {question.followUpProbes.map((probe, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-teal">→</span>
                  {probe}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function ConfirmDialog({
  action,
  onConfirm,
  onCancel,
}: {
  action: 'advance' | 'hold' | 'reject';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const config = {
    advance: {
      title: 'Advance Candidate?',
      message: 'This will move the candidate to the next stage of the hiring process.',
      confirmText: 'Advance',
      confirmClass: 'bg-green-600 hover:bg-green-700',
    },
    hold: {
      title: 'Put Candidate on Hold?',
      message: 'The candidate will be marked as on hold and can be reviewed later.',
      confirmText: 'Hold',
      confirmClass: 'bg-amber hover:bg-amber-600',
    },
    reject: {
      title: 'Reject Candidate?',
      message: 'This action cannot be undone. The candidate will be marked as rejected.',
      confirmText: 'Reject',
      confirmClass: 'bg-red-600 hover:bg-red-700',
    },
  };

  const { title, message, confirmText, confirmClass } = config[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-[#e5e5e0]">
        <h3 className="headline text-2xl mb-4">{title}</h3>
        <p className="text-[#6b7280] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-[#e5e5e0] text-[#1a1a1a] rounded-md hover:bg-[#fafaf8] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn('flex-1 px-4 py-2 text-white rounded-md transition-colors font-semibold', confirmClass)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function BriefSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      <div className="flex items-start gap-8 mb-10">
        <div className="w-32 h-32 rounded-full bg-[#e5e5e0]" />
        <div className="flex-1 space-y-4">
          <div className="h-12 bg-[#e5e5e0] rounded w-2/3" />
          <div className="h-6 bg-[#e5e5e0] rounded w-1/2" />
          <div className="flex gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-28 h-28 rounded-full bg-[#e5e5e0]" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_35%] gap-12">
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[#e5e5e0] rounded-lg" />
          ))}
        </div>
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-[#e5e5e0] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function generateAtsNote(brief: CandidateBrief): string {
  return `CANDIDATE BRIEF: ${brief.candidateName}
Role: ${brief.roleTitle}
Overall Fit: ${Math.round(brief.fitScore * 100)}%

KEY STRENGTHS:
${brief.verifiedClaims.slice(0, 3).map((c, i) => `${i + 1}. ${c.claimText} (${Math.round(c.confidence * 100)}% confidence)`).join('\n')}

TOP SHIPPED WORK:
${brief.shippedWork.slice(0, 3).map((w, i) => `${i + 1}. ${w.title}\n   ${w.description}\n   Tech: ${w.technologies.join(', ')}`).join('\n\n')}

RISKS:
${brief.risks.length === 0 ? 'None identified.' : brief.risks.map((r) => `• [${r.severity.toUpperCase()}] ${r.description}`).join('\n')}

RECOMMENDATION:
Evidence Score: ${Math.round(brief.evidenceScore * 100)}% | Confidence: ${Math.round(brief.confidenceScore * 100)}%
${brief.fitScore >= 0.7 ? '✓ RECOMMEND ADVANCE' : brief.fitScore >= 0.5 ? '⏸ CONSIDER FOR HOLD' : '✗ LIKELY REJECT'}

Generated by DeepHire AI on ${new Date(brief.createdAt).toLocaleDateString()}`;
}
