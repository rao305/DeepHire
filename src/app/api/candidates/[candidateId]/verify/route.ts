import { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { candidates } from '@/db/schema';
import { inngest, INNGEST_EVENTS } from '@/inngest/client';
import { AuthenticationError, AuthorizationError, requireAuth } from '@/lib/auth';
import {
  errorResponse,
  forbiddenError,
  notFoundError,
  serverError,
  successResponse,
  unauthorizedError,
} from '@/lib/api-response';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const user = await requireAuth();
    const { candidateId } = await params;

    const [candidate] = await db
      .select()
      .from(candidates)
      .where(and(
        eq(candidates.id, candidateId),
        eq(candidates.organizationId, user.organizationId)
      ))
      .limit(1);

    if (!candidate) {
      return notFoundError('Candidate');
    }

    if (!candidate.githubUrl) {
      return errorResponse(
        'Candidate must have a GitHub URL before verification can start',
        400,
        'MISSING_GITHUB_URL'
      );
    }

    const [updatedCandidate] = await db
      .update(candidates)
      .set({ status: 'analyzing' })
      .where(eq(candidates.id, candidate.id))
      .returning();

    await inngest.send({
      name: INNGEST_EVENTS.CANDIDATE_SUBMITTED,
      data: {
        candidateId: candidate.id,
        jobId: candidate.jobId,
        organizationId: user.organizationId,
      },
    });

    return successResponse({
      message: 'Verification started',
      candidateId: updatedCandidate.id,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) return unauthorizedError();
    if (error instanceof AuthorizationError) return forbiddenError();
    return serverError(error);
  }
}
