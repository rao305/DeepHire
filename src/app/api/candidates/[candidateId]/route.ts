import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { candidates, claims, shippedWork } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { EvidenceStore } from '@/agents/evidence/evidence-store';

export async function GET(
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

    const candidateClaims = await db
      .select()
      .from(claims)
      .where(eq(claims.candidateId, params.candidateId));

    const evidenceStore = new EvidenceStore();
    const evidence = await evidenceStore.getEvidenceForCandidate(params.candidateId);

    const work = await db
      .select()
      .from(shippedWork)
      .where(eq(shippedWork.candidateId, params.candidateId));

    return NextResponse.json({
      candidate,
      claims: candidateClaims,
      evidence,
      shippedWork: work,
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
  }
}
