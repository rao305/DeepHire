import { NextRequest } from 'next/server';
import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  analysisRuns,
  candidateBriefs,
  candidates,
  claims,
  evidencePackets,
  jobs,
} from '@/db/schema';
import { AuthenticationError, AuthorizationError, requireAuth } from '@/lib/auth';
import {
  forbiddenError,
  notFoundError,
  serverError,
  successResponse,
  unauthorizedError,
} from '@/lib/api-response';

type StepStatus = 'pending' | 'running' | 'completed' | 'error';

interface StatusStep {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const user = await requireAuth();
    const { candidateId } = await params;

    const [candidate] = await db
      .select({
        id: candidates.id,
        name: candidates.name,
        status: candidates.status,
        jobId: candidates.jobId,
        githubUrl: candidates.githubUrl,
        portfolioUrl: candidates.portfolioUrl,
        linkedinUrl: candidates.linkedinUrl,
        createdAt: candidates.createdAt,
      })
      .from(candidates)
      .where(
        and(
          eq(candidates.id, candidateId),
          eq(candidates.organizationId, user.organizationId)
        )
      )
      .limit(1);

    if (!candidate) {
      return notFoundError('Candidate');
    }

    const [job] = await db
      .select({ id: jobs.id, title: jobs.title })
      .from(jobs)
      .where(eq(jobs.id, candidate.jobId))
      .limit(1);

    const [claimsCountRow] = await db
      .select({ total: count() })
      .from(claims)
      .where(eq(claims.candidateId, candidateId));

    const packetsByAgent = await db
      .select({
        agentType: evidencePackets.agentType,
        total: count(),
      })
      .from(evidencePackets)
      .where(eq(evidencePackets.candidateId, candidateId))
      .groupBy(evidencePackets.agentType);

    const [brief] = await db
      .select({
        id: candidateBriefs.id,
        status: candidateBriefs.status,
      })
      .from(candidateBriefs)
      .where(eq(candidateBriefs.candidateId, candidateId))
      .limit(1);

    const [latestRun] = await db
      .select({
        status: analysisRuns.status,
        errorMessage: analysisRuns.errorMessage,
      })
      .from(analysisRuns)
      .where(eq(analysisRuns.candidateId, candidateId))
      .orderBy(desc(analysisRuns.createdAt))
      .limit(1);

    const claimCount = claimsCountRow?.total ?? 0;
    const packetCounts: Record<string, number> = Object.fromEntries(
      packetsByAgent.map((row) => [row.agentType, row.total])
    );

    const hasGithubApi = (packetCounts['github_api'] ?? 0) > 0;
    const hasGithubBrowser = (packetCounts['github_browser'] ?? 0) > 0;
    const hasPortfolio = (packetCounts['portfolio_browser'] ?? 0) > 0;
    const hasLinkedin = (packetCounts['linkedin'] ?? 0) > 0;
    const briefReady = brief?.status === 'complete';
    const briefStarted = !!brief;

    const candidateStatus = candidate.status;
    const isError =
      candidateStatus === 'error' || latestRun?.status === 'failed';
    const isComplete = candidateStatus === 'complete' && briefReady;
    const hasStarted = candidateStatus !== 'pending';

    // Step list is built from DB signals. Each step is `completed` once
    // its own signal lands; the active step is upgraded to `running`
    // below so only one step pulses at a time.
    const steps: StatusStep[] = [
      {
        id: 'parsing',
        label: 'Parsing Resume',
        status: hasStarted ? 'completed' : 'pending',
        detail: 'Extracting text from PDF',
      },
      {
        id: 'extracting',
        label: 'Extracting Claims',
        status: claimCount > 0 ? 'completed' : 'pending',
        detail:
          claimCount > 0
            ? `${claimCount} verifiable statement${claimCount === 1 ? '' : 's'} identified`
            : 'Identifying verifiable statements',
      },
      {
        id: 'github_api',
        label: 'GitHub API Research',
        status: hasGithubApi ? 'completed' : 'pending',
        detail: 'Fetching repository data',
      },
      {
        id: 'github_browser',
        label: 'GitHub Browser Research',
        status: hasGithubBrowser ? 'completed' : 'pending',
        detail: 'Inspecting repositories',
      },
    ];

    if (candidate.portfolioUrl) {
      steps.push({
        id: 'portfolio',
        label: 'Portfolio Research',
        status: hasPortfolio ? 'completed' : 'pending',
        detail: 'Reviewing portfolio site',
      });
    }

    if (candidate.linkedinUrl) {
      steps.push({
        id: 'linkedin',
        label: 'LinkedIn Check',
        status: hasLinkedin ? 'completed' : 'pending',
        detail: 'Cross-referencing employment timeline',
      });
    }

    steps.push({
      id: 'judging',
      label: 'Judging Evidence',
      status: briefStarted ? 'completed' : 'pending',
      detail: 'Evaluating findings',
    });

    steps.push({
      id: 'brief',
      label: 'Generating Brief',
      status: briefReady ? 'completed' : 'pending',
      detail: 'Writing candidate brief',
    });

    if (candidateStatus === 'analyzing' && !isComplete && !isError) {
      const nextIdx = steps.findIndex((s) => s.status !== 'completed');
      if (nextIdx >= 0) {
        steps[nextIdx] = { ...steps[nextIdx], status: 'running' };
      }
    }

    if (isError) {
      const nextIdx = steps.findIndex((s) => s.status !== 'completed');
      if (nextIdx >= 0) {
        steps[nextIdx] = { ...steps[nextIdx], status: 'error' };
      }
    }

    return successResponse({
      candidateId: candidate.id,
      name: candidate.name,
      jobId: candidate.jobId,
      jobTitle: job?.title ?? null,
      status: candidateStatus,
      createdAt: candidate.createdAt,
      briefReady,
      error: isError ? latestRun?.errorMessage ?? 'Analysis failed' : null,
      steps,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) return unauthorizedError();
    if (error instanceof AuthorizationError) return forbiddenError();
    return serverError(error);
  }
}
