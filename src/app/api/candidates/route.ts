import { NextRequest } from 'next/server';
import { and, count, countDistinct, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { candidates, claims, evidencePackets, jobs } from '@/db/schema';
import { AuthenticationError, AuthorizationError, requireAuth } from '@/lib/auth';
import {
  forbiddenError,
  notFoundError,
  serverError,
  successResponse,
  unauthorizedError,
  validationError,
} from '@/lib/api-response';
import { createCandidateSchema, zodFieldErrors } from '@/lib/validation';

const candidateStatuses = ['pending', 'analyzing', 'complete', 'error'] as const;

function parsePagination(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get('page') ?? 1) || 1, 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 20) || 20, 1), 100);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(request);

    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    if (status && !candidateStatuses.includes(status as typeof candidateStatuses[number])) {
      return validationError({ status: 'Invalid candidate status' });
    }

    const filters: SQL[] = [eq(candidates.organizationId, user.organizationId)];

    if (jobId) {
      const [job] = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(eq(jobs.id, jobId), eq(jobs.organizationId, user.organizationId)))
        .limit(1);

      if (!job) return notFoundError('Job');

      filters.push(eq(candidates.jobId, jobId));
    }

    if (status) {
      filters.push(eq(candidates.status, status as typeof candidateStatuses[number]));
    }

    const where = and(...filters);

    const [totalRow] = await db
      .select({ total: count() })
      .from(candidates)
      .where(where);

    const rows = await db
      .select({
        candidate: candidates,
        claimsCount: countDistinct(claims.id),
        evidencePacketsCount: countDistinct(evidencePackets.id),
      })
      .from(candidates)
      .leftJoin(claims, eq(claims.candidateId, candidates.id))
      .leftJoin(evidencePackets, eq(evidencePackets.candidateId, candidates.id))
      .where(where)
      .groupBy(candidates.id)
      .orderBy(desc(candidates.createdAt))
      .limit(limit)
      .offset(offset);

    return successResponse({
      candidates: rows.map((row) => ({
        ...row.candidate,
        claimsCount: row.claimsCount,
        evidencePacketsCount: row.evidencePacketsCount,
      })),
      pagination: {
        page,
        limit,
        total: totalRow?.total ?? 0,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) return unauthorizedError();
    if (error instanceof AuthorizationError) return forbiddenError();
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = createCandidateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(zodFieldErrors(parsed.error));
    }

    const [job] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(
        eq(jobs.id, parsed.data.jobId),
        eq(jobs.organizationId, user.organizationId)
      ))
      .limit(1);

    if (!job) return notFoundError('Job');

    const [candidate] = await db.insert(candidates).values({
      organizationId: user.organizationId,
      jobId: parsed.data.jobId,
      name: parsed.data.name,
      email: parsed.data.email,
      resumeText: parsed.data.resumeText ?? '',
      resumeUrl: parsed.data.resumeUrl,
      linkedinUrl: parsed.data.linkedinUrl,
      githubUrl: parsed.data.githubUrl,
      portfolioUrl: parsed.data.portfolioUrl,
      notes: parsed.data.notes,
      status: 'pending',
    }).returning();

    return successResponse(candidate, 201);
  } catch (error) {
    if (error instanceof AuthenticationError) return unauthorizedError();
    if (error instanceof AuthorizationError) return forbiddenError();
    return serverError(error);
  }
}
