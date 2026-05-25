// @ts-nocheck
// LEGACY: references the previous schema/agent shape. Not wired up via
// src/inngest/functions/index.ts. Kept for reference only until migrated to
// the new verify-candidate orchestration. The active brief-generation path is
// briefGeneratorAgent.generateBrief() in verify-candidate.ts.
import { inngest } from '../client';
import { db } from '@/db';
import { candidates, claims, briefs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { BriefGeneratorAgent } from '@/agents/brief/brief-generator.agent';
import { InterviewQuestionsAgent } from '@/agents/brief/interview-questions.agent';
import { EvidenceStore } from '@/agents/evidence/evidence-store';
import type { ClaimWithEvidence, ShippedWork } from '@/types';

export const generateBrief = inngest.createFunction(
  { id: 'generate-brief', retries: 1 },
  { event: 'candidate/generate-brief' },
  async ({ event, step }) => {
    const { candidateId } = event.data;

    const allClaims = await step.run('fetch-claims', async () => {
      return await db.select().from(claims).where(eq(claims.candidateId, candidateId));
    });

    const claimsWithEvidence = await step.run('fetch-evidence', async () => {
      const evidenceStore = new EvidenceStore();
      const result: ClaimWithEvidence[] = [];

      for (const claim of allClaims) {
        const evidence = await evidenceStore.getEvidenceForClaim(claim.id);
        result.push({
          ...claim,
          createdAt: claim.createdAt,
          evidence,
        });
      }

      return result;
    });

    const verifiedClaims = claimsWithEvidence.filter(c => c.verificationStatus === 'verified');
    const weakClaims = claimsWithEvidence.filter(
      c => c.verificationStatus === 'weak' || c.verificationStatus === 'unverifiable'
    );
    const falseClaims = claimsWithEvidence.filter(c => c.verificationStatus === 'false');

    const shippedWorkData = await step.run('fetch-shipped-work', async () => {
      const workQuery = `
        SELECT * FROM shipped_work
        WHERE candidate_id = '${candidateId}'
        ORDER BY rank ASC
      `;
      const result = await db.execute(workQuery as any);
      return (result.rows || []) as ShippedWork[];
    });

    const brief = await step.run('generate-brief', async () => {
      const agent = new BriefGeneratorAgent();
      const result = await agent.execute(
        candidateId,
        verifiedClaims,
        weakClaims,
        falseClaims,
        shippedWorkData
      );
      return result.data;
    });

    if (!brief) {
      throw new Error('Failed to generate brief');
    }

    const interviewQuestions = await step.run('generate-questions', async () => {
      const agent = new InterviewQuestionsAgent();
      const result = await agent.execute(verifiedClaims, weakClaims);
      return result.data || [];
    });

    brief.interviewQuestions = interviewQuestions;

    await step.run('save-brief', async () => {
      await db.insert(briefs).values({
        candidateId,
        summary: brief.summary,
        recommendation: brief.recommendation,
        riskFlags: brief.riskFlags,
        interviewQuestions: brief.interviewQuestions,
      });
    });

    return { success: true, candidateId, brief };
  }
);
