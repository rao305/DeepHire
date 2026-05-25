'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CandidateUploadForm } from '@/components/candidates/candidate-upload-form';
import Link from 'next/link';
import {
  Terminal,
  Edit2,
  Download,
  Plus,
  User,
  RefreshCw,
  X,
} from 'lucide-react';

async function fetchJob(jobId: string) {
  const res = await fetch(`/api/jobs/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

async function fetchCandidates(jobId: string) {
  const res = await fetch(`/api/jobs/${jobId}/candidates`);
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [activeTab, setActiveTab] = useState<'candidates' | 'rubric'>('candidates');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId),
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: () => fetchCandidates(jobId),
  });

  const rubric = job?.rubric || {};

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-12 border-l-2 border-terminal-green pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-6 h-6 text-terminal-green" />
          <h1 className="text-2xl font-mono text-terminal-green tracking-tight">
            {jobLoading ? '~/jobs/...' : `~/jobs/${job?.title || ''}`}
          </h1>
          <button className="ml-2 text-[#8b949e] hover:text-terminal-green transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs font-mono text-[#8b949e] tracking-wider">
          ROLE EVALUATION AND CANDIDATE ANALYSIS
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-1 border-b border-[#1a1a1f]">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-6 py-3 text-xs font-mono tracking-wider transition-all ${
            activeTab === 'candidates'
              ? 'text-terminal-green border-b-2 border-terminal-green -mb-px'
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          CANDIDATES
          {!candidatesLoading && candidates && (
            <span className="ml-2 text-[10px] opacity-60">
              ({candidates.length})
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rubric')}
          className={`px-6 py-3 text-xs font-mono tracking-wider transition-all ${
            activeTab === 'rubric'
              ? 'text-terminal-green border-b-2 border-terminal-green -mb-px'
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          ROLE RUBRIC
        </button>
      </div>

      {/* Candidates Tab */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-[#8b949e]">
              {candidatesLoading ? (
                <span className="animate-pulse">LOADING...</span>
              ) : (
                <span>
                  {candidates?.length || 0} CANDIDATE
                  {candidates?.length !== 1 ? 'S' : ''} ANALYZED
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-3 h-3 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-3 h-3 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>

          {/* Candidates Table */}
          {candidatesLoading ? (
            <div className="text-center py-12 text-xs font-mono text-[#8b949e] animate-pulse">
              LOADING CANDIDATES...
            </div>
          ) : !candidates || candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#27272a]">
              <User className="w-12 h-12 text-[#3f3f46] mb-4" />
              <h3 className="text-sm font-mono text-[#8b949e] mb-2">
                NO CANDIDATES YET
              </h3>
              <p className="text-xs font-mono text-[#3f3f46] mb-6">
                Add candidates to start AI-powered analysis
              </p>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-3 h-3 mr-2" />
                Add First Candidate
              </Button>
            </div>
          ) : (
            <div className="border border-[#1a1a1f] bg-[#0f1116]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1a1a1f] bg-[#0a0e14]">
                <div className="col-span-3 text-[10px] font-mono text-[#8b949e] tracking-wider">
                  NAME
                </div>
                <div className="col-span-2 text-[10px] font-mono text-[#8b949e] tracking-wider">
                  STATUS
                </div>
                <div className="col-span-2 text-[10px] font-mono text-[#8b949e] tracking-wider">
                  FIT SCORE
                </div>
                <div className="col-span-2 text-[10px] font-mono text-[#8b949e] tracking-wider">
                  EVIDENCE
                </div>
                <div className="col-span-2 text-[10px] font-mono text-[#8b949e] tracking-wider">
                  DATE
                </div>
                <div className="col-span-1 text-[10px] font-mono text-[#8b949e] tracking-wider">
                  ACTIONS
                </div>
              </div>

              {/* Table Rows */}
              {candidates.map((candidate: any, idx: number) => {
                const analysis = candidate.analysis || {};
                const date = new Date(candidate.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                  }
                );

                return (
                  <div
                    key={candidate.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a1a1f] hover:bg-[#0a0e14] transition-colors group"
                    style={{
                      animation: `in 0.2s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-terminal-green/10 border border-terminal-green/30 flex items-center justify-center">
                        <User className="w-4 h-4 text-terminal-green" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-[#e6edf3]">
                          {candidate.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#8b949e]">
                          {candidate.email}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <StatusBadge
                        status={
                          candidate.status || 'pending'
                        }
                      />
                    </div>

                    <div className="col-span-2 flex items-center">
                      <div className="text-lg font-mono text-terminal-green tabular-nums">
                        {analysis.fitScore || '--'}
                        <span className="text-xs text-[#8b949e]">%</span>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <div className="text-lg font-mono text-terminal-amber tabular-nums">
                        {analysis.evidenceScore || '--'}
                        <span className="text-xs text-[#8b949e]">%</span>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <div className="text-xs font-mono text-[#8b949e] uppercase">
                        {date}
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center gap-2">
                      <Link href={`/candidates/${candidate.id}/brief`}>
                        <button className="text-xs font-mono text-terminal-green hover:text-terminal-green/80 transition-colors">
                          VIEW
                        </button>
                      </Link>
                      <button className="text-xs font-mono text-[#8b949e] hover:text-terminal-amber transition-colors">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Rubric Tab */}
      {activeTab === 'rubric' && (
        <div className="max-w-4xl space-y-8">
          {jobLoading ? (
            <div className="text-center py-12 text-xs font-mono text-[#8b949e] animate-pulse">
              LOADING RUBRIC...
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-4">
                <div>
                  <div className="text-[10px] font-mono text-[#8b949e] mb-2">
                    SENIORITY LEVEL
                  </div>
                  <div className="text-lg font-mono text-terminal-amber uppercase">
                    {rubric.seniority || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="border border-[#1a1a1f] bg-[#0f1116] p-6 space-y-6">
                <div>
                  <div className="text-[10px] font-mono text-terminal-green mb-3 tracking-wider">
                    MUST-HAVE SKILLS ({rubric.mustHaveSkills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rubric.mustHaveSkills?.map((skill: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-terminal-green/10 border border-terminal-green/30 px-3 py-1 text-xs font-mono text-terminal-green"
                      >
                        {skill}
                      </div>
                    )) || (
                      <div className="text-xs font-mono text-[#8b949e]">
                        None configured
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-terminal-amber mb-3 tracking-wider">
                    NICE-TO-HAVE SKILLS ({rubric.niceToHaveSkills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rubric.niceToHaveSkills?.map((skill: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-terminal-amber/10 border border-terminal-amber/30 px-3 py-1 text-xs font-mono text-terminal-amber"
                      >
                        {skill}
                      </div>
                    )) || (
                      <div className="text-xs font-mono text-[#8b949e]">
                        None configured
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Weights */}
              <div className="border border-[#1a1a1f] bg-[#0f1116] p-6">
                <div className="text-[10px] font-mono text-[#8b949e] mb-6 tracking-wider">
                  EVALUATION WEIGHTS
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {rubric.weights &&
                    Object.entries(rubric.weights).map(([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="bg-[#0a0e14] border border-[#27272a] px-4 py-4"
                      >
                        <div className="text-[10px] text-[#8b949e] mb-2">
                          {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                        </div>
                        <div className="text-2xl font-mono text-terminal-green tabular-nums">
                          {value}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add Candidate Dialog */}
      {showAddDialog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 z-50 overflow-y-auto"
          onClick={() => setShowAddDialog(false)}
        >
          <div
            className="border border-[#1a1a1f] bg-[#0f1116] p-6 sm:p-8 max-w-2xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#1a1a1f]">
              <div className="border-l-2 border-terminal-green pl-4">
                <h3 className="text-sm font-mono text-terminal-green mb-1 tracking-wider">
                  ADD CANDIDATE
                </h3>
                <p className="text-xs font-mono text-[#8b949e]">
                  Upload resume, link public profiles, kick off analysis
                </p>
              </div>
              <button
                onClick={() => setShowAddDialog(false)}
                className="text-[#8b949e] hover:text-terminal-red transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CandidateUploadForm
              jobId={jobId}
              onSuccess={() => setShowAddDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
