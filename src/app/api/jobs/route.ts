import { NextRequest } from 'next/server';
import { count, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { inngest, INNGEST_EVENTS } from '@/inngest/client';
import { AuthenticationError, AuthorizationError, requireAuth } from '@/lib/auth';
import {
  forbiddenError,
  serverError,
  successResponse,
  unauthorizedError,
  validationError,
} from '@/lib/api-response';
import { createJobSchema, zodFieldErrors } from '@/lib/validation';
import type { JobRubric } from '@/types';

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

async function parseJobDescription(title: string): Promise<JobRubric> {
  return {
    title,
    seniority: 'mid',
    mustHaveSkills: [],
    niceToHaveSkills: [],
    focusAreas: [],
    domainExpertise: [],
    weights: {
      technical_depth: 0,
      shipped_work: 0,
      leadership: 0,
      scale_experience: 0,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { page, limit, offset } = parsePagination(request);

    const [totalRow] = await db
      .select({ total: count() })
      .from(jobs)
      .where(eq(jobs.organizationId, user.organizationId));

    const rows = await db
      .select()
      .from(jobs)
      .where(eq(jobs.organizationId, user.organizationId))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    return successResponse({
      jobs: rows,
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
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(zodFieldErrors(parsed.error));
    }

    const rubric =
      (parsed.data.rubric as JobRubric | undefined) ??
      (await parseJobDescription(parsed.data.title));

    const [job] = await db.insert(jobs).values({
      organizationId: user.organizationId,
      title: parsed.data.title,
      description: parsed.data.description,
      rubric,
      status: 'active',
    }).returning();

    await inngest.send({
      name: INNGEST_EVENTS.JOB_CREATED,
      data: {
        jobId: job.id,
        organizationId: user.organizationId,
      },
    });

    return successResponse(job, 201);
  } catch (error) {
    if (error instanceof AuthenticationError) return unauthorizedError();
    if (error instanceof AuthorizationError) return forbiddenError();
    return serverError(error);
  }
}
