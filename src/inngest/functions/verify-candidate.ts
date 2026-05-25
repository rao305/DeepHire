import { eq } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "@/db/index";
import {
  candidateBriefs,
  candidates,
  claims as claimsTable,
  jobs,
} from "@/db/schema";
import { jdParserAgent } from "@/agents/jd-parser.agent";
import { claimExtractorAgent } from "@/agents/claim-extractor.agent";
import { claimPrioritizerAgent } from "@/agents/claim-prioritizer.agent";
import { githubOrchestrator } from "@/agents/github/github.orchestrator";
import type { GitHubVerificationResult } from "@/agents/github/github.orchestrator";
import {
  portfolioOrchestrator,
  type PortfolioVerificationResult,
} from "@/agents/portfolio/portfolio.orchestrator";
import { linkedinAgent } from "@/agents/linkedin/linkedin.agent";
import { briefGeneratorAgent } from "@/agents/brief/brief-generator.agent";
import { evidenceStore } from "@/agents/evidence/evidence-store";
import { evidenceJudgeAgent } from "@/agents/evidence/evidence-judge.agent";
import { shippedWorkRanker } from "@/agents/evidence/shipped-work-ranker.agent";
import type { EvidencePacket } from "@/types";
import type { JudgmentResult } from "@/agents/evidence/evidence-judge.agent";

export const verifyCandidateFunction = inngest.createFunction(
  {
    id: "verify-candidate",
    name: "Verify Candidate",
    concurrency: { limit: 5 },
    retries: 2,
    // Inngest v3 exposes timeouts.{start,finish}; finish is the hard-cap
    // equivalent of the spec's run timeout.
    timeouts: { finish: "15m" },
  },
  { event: "candidate/submitted" },
  async ({ event, step }) => {
    const { candidateId, jobId } = event.data;
    let runId: string | undefined;

    try {
      const { candidate, job, runId: createdRunId } = await step.run(
        "fetch-data",
        async () => {
          const candidate = await db.query.candidates.findFirst({
            where: eq(candidates.id, candidateId),
          });
          const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
          });

          if (!candidate) {
            throw new Error(`Candidate ${candidateId} not found`);
          }

          if (!job) {
            throw new Error(`Job ${jobId} not found`);
          }

          const runId = await evidenceStore.createAnalysisRun(candidateId, jobId);
          await db
            .update(candidates)
            .set({ status: "analyzing" })
            .where(eq(candidates.id, candidateId));

          return { candidate, job, runId };
        }
      );
      runId = createdRunId;

      const jobRubric = await step.run("parse-jd", async () => {
        return jdParserAgent.parseJobDescription(job.description);
      });

      const { claims, aiPolishScore } = await step.run(
        "extract-claims",
        async () => {
          const extractedClaims = await claimExtractorAgent.extractClaims(
            candidate.resumeText,
            jobRubric
          );
          const aiPolish = await claimExtractorAgent.detectAIPolishing(
            candidate.resumeText,
            job.description
          );

          await db.insert(claimsTable).values(
            extractedClaims.map((claim) => ({
              id: claim.id,
              candidateId,
              type: claim.type,
              text: claim.text,
              keywords: claim.keywords,
              jobRelevance: claim.jobRelevance,
              priority: claim.priority,
              verificationStrategy: claim.verificationStrategy,
            }))
          );

          return {
            claims: extractedClaims,
            aiPolishScore: aiPolish.score,
          };
        }
      );

      const verificationPlan = await step.run("prioritize-claims", async () => {
        return claimPrioritizerAgent.prioritizeClaims(
          claims,
          jobRubric,
          {
            github: candidate.githubUrl ?? undefined,
            portfolio: candidate.portfolioUrl ?? undefined,
            linkedin: candidate.linkedinUrl ?? undefined,
          },
          5
        );
      });

      let githubResult: GitHubVerificationResult | null = null;
      if (candidate.githubUrl) {
        githubResult = (await step.run("github-verification", async () => {
          return githubOrchestrator.verifyCandidateOnGitHub(
            candidateId,
            candidate.githubUrl!,
            claims,
            jobRubric,
            verificationPlan,
            runId!
          );
        })) as unknown as GitHubVerificationResult;
      }

      let portfolioResult: PortfolioVerificationResult | null = null;
      if (candidate.portfolioUrl) {
        portfolioResult = (await step.run("portfolio-verification", async () => {
          return portfolioOrchestrator.verifyPortfolio(
            candidate.portfolioUrl!,
            claims,
            jobRubric,
            runId!
          );
        })) as unknown as PortfolioVerificationResult;
      }

      let linkedinResult: { evidencePackets: EvidencePacket[] } | null = null;
      if (candidate.linkedinUrl) {
        const timelineClaims = verificationPlan.highPriority
          .filter((task) => task.agents.includes("linkedin"))
          .map((task) => task.claim);

        if (timelineClaims.length > 0) {
          linkedinResult = (await step.run("linkedin-verification", async () => {
            // TODO: Extract resume positions from candidate.resumeText using AI
            // For now, passing empty array - LinkedIn agent will compare against available positions
            const resumePositions: Array<{ company: string; title: string; startDate: string; endDate?: string }> = [];

            return linkedinAgent.verifyTimeline(
              candidate.linkedinUrl!,
              timelineClaims,
              resumePositions,
              { candidateId }
            );
          })) as unknown as { evidencePackets: EvidencePacket[] };
        }
      }

      const judgmentEntries = (await step.run("judge-evidence", async () => {
        const allPackets = [
          ...(githubResult?.evidencePackets ?? []),
          ...(portfolioResult?.evidencePackets ?? []),
          ...(linkedinResult?.evidencePackets ?? []),
        ];

        const judgments = await evidenceJudgeAgent.judgeAllClaims(
          claims,
          allPackets,
          candidate.name
        );
        return Array.from(judgments.entries());
      })) as Array<[string, JudgmentResult]>;
      const judgments = new Map(judgmentEntries);

      const { scores, risks } = await step.run("calculate-scores", async () => {
        const allWork = [
          ...(githubResult?.shippedWork ?? []),
          ...(portfolioResult?.shippedWork ?? []),
        ];
        const scores = evidenceJudgeAgent.calculateScores(
          claims,
          judgments,
          jobRubric,
          allWork
        );
        const risks = await evidenceJudgeAgent.detectRiskFlags(
          claims,
          judgments,
          aiPolishScore
        );

        return { scores, risks };
      });

      const rankedWork = await step.run("rank-shipped-work", async () => {
        const allWork = [
          ...(githubResult?.shippedWork ?? []),
          ...(portfolioResult?.shippedWork ?? []),
        ];

        return shippedWorkRanker.rankShippedWork(
          allWork,
          jobRubric,
          candidate.name
        );
      });

      const brief = await step.run("generate-brief", async () => {
        return briefGeneratorAgent.generateBrief({
          candidate,
          job,
          jobRubric,
          claims,
          judgments,
          scores,
          risks,
          shippedWork: rankedWork,
          evidencePackets: [
            ...(githubResult?.evidencePackets ?? []),
            ...(portfolioResult?.evidencePackets ?? []),
            ...(linkedinResult?.evidencePackets ?? []),
          ],
        });
      });

      await step.run("finalize", async () => {
        await db.insert(candidateBriefs).values({
          candidateId,
          jobId,
          ...brief,
          status: "complete",
        });
        await db
          .update(candidates)
          .set({ status: "complete" })
          .where(eq(candidates.id, candidateId));

        const totalCost =
          (githubResult?.totalCost ?? 0) +
          (portfolioResult?.totalCost ?? 0) +
          0.02;
        await evidenceStore.completeAnalysisRun(runId!, totalCost);
      });

      return { success: true, candidateId };
    } catch (error) {
      await step.run("handle-error", async () => {
        await db
          .update(candidates)
          .set({ status: "error" })
          .where(eq(candidates.id, candidateId));

        if (runId) {
          const message =
            error instanceof Error ? error.message : "Unknown verification error";
          await evidenceStore.failAnalysisRun(runId, message);
        }
      });

      throw error;
    }
  }
);

export { verifyCandidateFunction as verifyCandidate };
