import { randomUUID } from "crypto";
import { portfolioBrowserAgent } from "./portfolio-browser.agent";
import { evidenceStore } from "@/agents/evidence/evidence-store";
import type {
  ExtractedClaim,
  JobRubric,
  EvidencePacket,
  ShippedWorkItem,
  Evidence,
  RetrievalBudget,
} from "@/types";

export interface PortfolioVerificationResult {
  evidencePackets: EvidencePacket[];
  shippedWork: ShippedWorkItem[];
  totalCost: number;
  summary: {
    projectsFound: number;
    liveDemosFound: number;
    techStackCoverage: number;
  };
}

export class PortfolioOrchestrator {
  /**
   * Verifies a candidate's portfolio by discovering shipped work and matching evidence to claims.
   *
   * Cost estimate: ~15 vision calls * $0.075/1M * 500 tokens ≈ $0.001 per call ≈ $0.015 total
   */
  async verifyPortfolio(
    portfolioUrl: string,
    claims: ExtractedClaim[],
    jobRubric: JobRubric,
    analysisRunId: string
  ): Promise<PortfolioVerificationResult> {
    console.log(`[Orchestrator] Starting portfolio verification for ${portfolioUrl}`);

    const evidencePackets: EvidencePacket[] = [];
    const allShippedWork: ShippedWorkItem[] = [];
    let totalCost = 0;

    try {
      // Step 1: Run portfolioBrowserAgent.discoverShippedWork() with full budget
      const fullBudget: RetrievalBudget = {
        maxSteps: 20,
        maxTimeSeconds: 120,
        maxVisionCalls: 15,
        minEvidenceThreshold: 3,
      };

      const packetId = randomUUID();

      console.log(`[Orchestrator] Discovering shipped work with packet ID: ${packetId}`);
      const portfolioEvidence = await portfolioBrowserAgent.discoverShippedWork(
        portfolioUrl,
        claims,
        jobRubric,
        fullBudget,
        packetId
      );

      console.log(`[Orchestrator] Found ${portfolioEvidence.shippedWork.length} projects`);
      allShippedWork.push(...portfolioEvidence.shippedWork);

      // Step 2: Create EvidencePacket for each ShippedWorkItem linked to most relevant claim
      for (const workItem of portfolioEvidence.shippedWork) {
        const relevantClaim = this.findMostRelevantClaim(workItem, claims);

        if (relevantClaim) {
          // Create an EvidencePacket linking this work to the claim
          const packet: EvidencePacket = {
            id: randomUUID(),
            candidateId: analysisRunId,
            claimId: relevantClaim.id,
            claimText: relevantClaim.text,
            claimType: relevantClaim.type,
            agentType: "portfolio_browser",
            retrievalMode: "browser",
            verdict: "SUPPORTED",
            confidence: workItem.relevanceToRole,
            evidence: portfolioEvidence.evidence.filter(e =>
              e.snippets.some(s => s.text.includes(workItem.title))
            ),
            provenance: [],
            shippedWork: [workItem],
            visitedUrls: portfolioEvidence.visitedUrls,
            totalSteps: portfolioEvidence.totalSteps,
            visionCallCount: portfolioEvidence.foundProjectCount,
            costUSD: this.estimateVisionCost(1),
            createdAt: new Date(),
          };

          // Step 3: Save all via evidenceStore
          await evidenceStore.saveEvidencePacket(packet);
          evidencePackets.push(packet);
          totalCost += packet.costUSD;
        }
      }

      // Step 4: Calculate techStackCoverage: % of mustHaveSkills found in discovered technologies
      const techStackCoverage = this.calculateTechStackCoverage(
        allShippedWork,
        jobRubric
      );

      // Step 5: Return result
      const result: PortfolioVerificationResult = {
        evidencePackets,
        shippedWork: allShippedWork,
        totalCost,
        summary: {
          projectsFound: allShippedWork.length,
          liveDemosFound: allShippedWork.filter(w => w.hasLiveDemo).length,
          techStackCoverage,
        },
      };

      console.log(`[Orchestrator] Portfolio verification complete:`, result.summary);
      return result;

    } catch (error) {
      console.error(`[Orchestrator] Portfolio verification failed:`, error);
      throw error;
    }
  }

  /**
   * Finds a specific project in the portfolio that supports a given claim.
   */
  async findProjectForClaim(
    portfolioUrl: string,
    claim: ExtractedClaim
  ): Promise<Evidence[]> {
    console.log(`[Orchestrator] Searching for project supporting claim: ${claim.text}`);

    const budget: RetrievalBudget = {
      maxSteps: 5,
      maxTimeSeconds: 30,
      maxVisionCalls: 3,
      minEvidenceThreshold: 1,
    };

    const packetId = randomUUID();

    try {
      const evidence = await portfolioBrowserAgent.verifySpecificClaim(
        portfolioUrl,
        claim,
        budget,
        packetId
      );

      console.log(`[Orchestrator] Found ${evidence.length} evidence items for claim`);
      return evidence;
    } catch (error) {
      console.error(`[Orchestrator] Failed to find project for claim:`, error);
      return [];
    }
  }

  /**
   * Finds the most relevant claim for a given shipped work item based on:
   * - Technology overlap
   * - Keyword matching
   * - Claim type relevance
   */
  private findMostRelevantClaim(
    workItem: ShippedWorkItem,
    claims: ExtractedClaim[]
  ): ExtractedClaim | null {
    if (claims.length === 0) return null;

    let bestClaim: ExtractedClaim | null = null;
    let bestScore = 0;

    const workTech = workItem.technologies.map(t => t.toLowerCase());
    const workText = `${workItem.title} ${workItem.description}`.toLowerCase();

    for (const claim of claims) {
      let score = 0;

      // Technology overlap (weight: 0.5)
      const techOverlap = claim.keywords.filter(keyword =>
        workTech.some(tech => tech.includes(keyword.toLowerCase()))
      ).length;
      score += (techOverlap / Math.max(claim.keywords.length, 1)) * 0.5;

      // Keyword matching in text (weight: 0.3)
      const keywordMatches = claim.keywords.filter(keyword =>
        workText.includes(keyword.toLowerCase())
      ).length;
      score += (keywordMatches / Math.max(claim.keywords.length, 1)) * 0.3;

      // Claim type relevance (weight: 0.2)
      if (claim.type === "project" || claim.type === "skill") {
        score += 0.2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestClaim = claim;
      }
    }

    return bestScore > 0.3 ? bestClaim : null;
  }

  /**
   * Calculates what percentage of must-have skills from the job rubric
   * are found in the discovered technologies.
   */
  private calculateTechStackCoverage(
    shippedWork: ShippedWorkItem[],
    jobRubric: JobRubric
  ): number {
    if (jobRubric.mustHaveSkills.length === 0) return 0;

    const allTech = new Set<string>();
    for (const work of shippedWork) {
      for (const tech of work.technologies) {
        allTech.add(tech.toLowerCase());
      }
    }

    const mustHaveSkills = jobRubric.mustHaveSkills.map(s => s.toLowerCase());
    let matchCount = 0;

    for (const skill of mustHaveSkills) {
      if (Array.from(allTech).some(tech =>
        tech.includes(skill) || skill.includes(tech)
      )) {
        matchCount++;
      }
    }

    return matchCount / mustHaveSkills.length;
  }

  /**
   * Estimates the cost of vision API calls.
   * Based on: $0.075 per 1M tokens, ~500 tokens per vision call.
   */
  private estimateVisionCost(visionCallCount: number): number {
    const tokensPerCall = 500;
    const costPerMillionTokens = 0.075;
    return (visionCallCount * tokensPerCall * costPerMillionTokens) / 1_000_000;
  }
}

export const portfolioOrchestrator = new PortfolioOrchestrator();
