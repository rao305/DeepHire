'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Terminal,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ProgressSteps,
  type ProgressStep,
} from '@/components/ui/progress-steps';

interface StatusResponse {
  candidateId: string;
  name: string;
  jobId: string;
  jobTitle: string | null;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  createdAt: string;
  briefReady: boolean;
  error: string | null;
  steps: ProgressStep[];
}

async function fetchStatus(candidateId: string): Promise<StatusResponse> {
  const res = await fetch(`/api/candidates/${candidateId}/status`);
  const payload = await res.json();
  if (!res.ok || payload?.success === false) {
    throw new Error(payload?.error || 'Failed to load candidate status');
  }
  return payload.data as StatusResponse;
}

function timeSince(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fireConfetti() {
  const duration = 1500;
  const end = Date.now() + duration;
  const colors = ['#00ff88', '#ffb454', '#00b4ff', '#f5f5f5'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export default function CandidateAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  const [elapsed, setElapsed] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const confettiFiredRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['candidate-status', candidateId],
    queryFn: () => fetchStatus(candidateId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'analyzing' || status === 'pending' ? 3000 : false;
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!data?.createdAt) return;
    const tick = () => setElapsed(timeSince(data.createdAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.createdAt]);

  useEffect(() => {
    if (data?.briefReady && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      fireConfetti();
      redirectTimerRef.current = setTimeout(() => {
        router.push(`/candidates/${candidateId}/brief`);
      }, 2000);
    }
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [data?.briefReady, candidateId, router]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/verify`, {
        method: 'POST',
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error || 'Failed to restart analysis');
      }
      confettiFiredRef.current = false;
      await refetch();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="border-l-2 border-terminal-green pl-6 mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-6 h-6 text-terminal-green animate-spin" />
            <h1 className="text-2xl font-mono text-terminal-green tracking-tight">
              ~/candidates/loading...
            </h1>
          </div>
          <p className="text-xs font-mono text-[#8b949e] tracking-wider">
            FETCHING ANALYSIS STATUS
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-8">
        <div className="border-l-2 border-terminal-red pl-6 mb-12">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-terminal-red" />
            <h1 className="text-2xl font-mono text-terminal-red tracking-tight">
              ~/candidates/error
            </h1>
          </div>
          <p className="text-xs font-mono text-[#8b949e] tracking-wider">
            {error instanceof Error
              ? error.message.toUpperCase()
              : 'CANDIDATE NOT FOUND'}
          </p>
        </div>
        <Link href="/candidates">
          <Button variant="outline">Back to candidates</Button>
        </Link>
      </div>
    );
  }

  const isAnalyzing = data.status === 'analyzing' || data.status === 'pending';
  const isError = data.status === 'error' || !!data.error;
  const completedCount = data.steps.filter(
    (s) => s.status === 'completed'
  ).length;

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-10 border-l-2 border-terminal-green pl-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Terminal className="w-6 h-6 text-terminal-green" />
          <h1 className="text-2xl font-mono text-terminal-green tracking-tight">
            ~/candidates/{data.name.toLowerCase().replace(/\s+/g, '-') || 'unknown'}
          </h1>
          <StatusBadge status={data.status} />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e] tracking-wider flex-wrap">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>{data.name.toUpperCase()}</span>
          </div>
          {data.jobTitle && (
            <>
              <span className="text-[#3f3f46]">/</span>
              <Link
                href={`/jobs/${data.jobId}`}
                className="hover:text-terminal-green transition-colors"
              >
                {data.jobTitle.toUpperCase()}
              </Link>
            </>
          )}
          <span className="text-[#3f3f46]">/</span>
          <span className="text-[#8b949e] tabular-nums">
            SUBMITTED {elapsed || timeSince(data.createdAt)}
          </span>
        </div>
      </div>

      {/* Brief Ready banner */}
      {data.briefReady && (
        <div className="mb-8 border border-terminal-green/40 bg-terminal-green/10 p-5 animate-pulse-green">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-terminal-green" />
              <div>
                <div className="text-sm font-mono text-terminal-green tracking-wider">
                  BRIEF READY
                </div>
                <div className="text-[11px] font-mono text-[#8b949e] mt-1">
                  Auto-redirecting to candidate brief in 2 seconds&hellip;
                </div>
              </div>
            </div>
            <Link href={`/candidates/${candidateId}/brief`}>
              <Button size="sm">
                View Brief
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Error banner */}
      {isError && !data.briefReady && (
        <div className="mb-8 border border-terminal-red/40 bg-terminal-red/10 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 min-w-0">
              <AlertCircle className="w-6 h-6 text-terminal-red shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-mono text-terminal-red tracking-wider">
                  ANALYSIS FAILED
                </div>
                <div className="text-[11px] font-mono text-[#8b949e] mt-1 break-words">
                  {data.error || 'The verification pipeline could not complete.'}
                </div>
                {retryError && (
                  <div className="text-[11px] font-mono text-terminal-red mt-2">
                    {retryError}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Retry Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Progress section */}
      <div className="border border-[#1a1a1f] bg-[#0f1116] p-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1a1a1f] flex-wrap gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#8b949e] tracking-wider mb-1">
              VERIFICATION PIPELINE
            </div>
            <div className="text-sm font-mono text-[#e6edf3]">
              {data.briefReady
                ? 'All steps complete'
                : isError
                ? 'Pipeline halted'
                : `${completedCount} / ${data.steps.length} steps complete`}
            </div>
          </div>
          {isAnalyzing && !isError && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-terminal-blue tracking-wider">
              <div className="w-1.5 h-1.5 bg-terminal-blue animate-pulse" />
              POLLING EVERY 3s
            </div>
          )}
        </div>

        <ProgressSteps steps={data.steps} />
      </div>

      {/* Metadata footer */}
      <div className="mt-8 grid grid-cols-3 gap-px bg-[#1a1a1f] border border-[#1a1a1f]">
        <div className="bg-[#0a0e14] px-5 py-4">
          <div className="text-[10px] font-mono text-[#8b949e] tracking-wider mb-1">
            STATUS
          </div>
          <div className="text-sm font-mono text-terminal-green uppercase tabular-nums">
            {data.status}
          </div>
        </div>
        <div className="bg-[#0a0e14] px-5 py-4">
          <div className="text-[10px] font-mono text-[#8b949e] tracking-wider mb-1">
            STEPS DONE
          </div>
          <div className="text-sm font-mono text-terminal-amber tabular-nums">
            {completedCount}/{data.steps.length}
          </div>
        </div>
        <div className="bg-[#0a0e14] px-5 py-4">
          <div className="text-[10px] font-mono text-[#8b949e] tracking-wider mb-1">
            ELAPSED
          </div>
          <div className="text-sm font-mono text-[#e6edf3] tabular-nums">
            {elapsed || timeSince(data.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
