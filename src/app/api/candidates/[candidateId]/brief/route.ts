import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { candidates, briefs, jobs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/inngest/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [brief] = await db
      .select()
      .from(briefs)
      .where(eq(briefs.candidateId, params.candidateId));

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    return NextResponse.json(brief);
  } catch (error) {
    console.error('Error fetching brief:', error);
    return NextResponse.json({ error: 'Failed to fetch brief' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [candidate] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, params.candidateId));

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, candidate.jobId));

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (candidate.status !== 'completed') {
      return NextResponse.json({ error: 'Verification not completed' }, { status: 400 });
    }

    await inngest.send({
      name: 'candidate/generate-brief',
      data: {
        candidateId: params.candidateId,
      },
    });

    return NextResponse.json({ success: true, message: 'Brief generation started' });
  } catch (error) {
    console.error('Error generating brief:', error);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}
