import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/index";
import { uploadScreenshotToR2 } from "@/lib/r2";
import type {
  ClaimVerdict,
  Evidence,
  EvidencePacket,
  ProvenanceLog,
  ShippedWorkItem,
} from "@/types";

type EvidenceWithScreenshotBuffer = Evidence & {
  screenshot?: Buffer;
  screenshotBuffer?: Buffer;
  stepNumber?: number;
  pageUrl?: string;
};

type ProvenanceWithScreenshotBuffer = ProvenanceLog & {
  screenshot?: Buffer;
  screenshotBuffer?: Buffer;
};

interface ScreenshotRecord {
  packetId: string;
  s3Key: string;
  pageUrl: string;
  stepNumber: number;
}

export class EvidenceStore {
  async saveEvidencePacket(packet: EvidencePacket): Promise<string> {
    const packetId = packet.id ?? randomUUID();

    try {
      this.logInfo("saveEvidencePacket:start", {
        packetId,
        candidateId: packet.candidateId,
        claimId: packet.claimId,
      });

      const evidenceResult = await this.uploadEvidenceScreenshots(
        packet.evidence,
        packetId
      );
      const provenanceResult = await this.uploadProvenanceScreenshots(
        packet.provenance,
        packetId
      );

      await db.insert(schema.evidencePackets).values({
        id: packetId,
        candidateId: packet.candidateId,
        claimId: packet.claimId,
        agentType: packet.agentType,
        retrievalMode: packet.retrievalMode,
        verdict: packet.verdict,
        confidence: packet.confidence,
        evidence: evidenceResult.evidence,
        provenance: provenanceResult.provenance,
        shippedWork: packet.shippedWork ?? null,
        visitedUrls: packet.visitedUrls,
        totalSteps: packet.totalSteps,
        visionCallCount: packet.visionCallCount,
        costUsd: packet.costUSD,
        createdAt: packet.createdAt,
      });

      await this.insertScreenshotRecords([
        ...evidenceResult.screenshots,
        ...provenanceResult.screenshots,
      ]);

      for (const item of packet.shippedWork ?? []) {
        await this.saveShippedWorkItem(item, packet.candidateId, packetId);
      }

      this.logInfo("saveEvidencePacket:complete", { packetId });
      return packetId;
    } catch (error) {
      this.logError("saveEvidencePacket:failed", error, { packetId });
      throw new Error(
        `Failed to save evidence packet ${packetId}: ${this.errorMessage(error)}`
      );
    }
  }

  async saveScreenshot(
    screenshot: Buffer,
    packetId: string,
    stepNumber: number,
    pageUrl: string
  ): Promise<string> {
    try {
      this.logInfo("saveScreenshot:start", { packetId, stepNumber, pageUrl });

      const s3Key = await this.uploadScreenshotBuffer(
        screenshot,
        packetId,
        stepNumber
      );

      await db.insert(schema.evidenceScreenshots).values({
        packetId,
        s3Key,
        pageUrl,
        stepNumber,
      });

      this.logInfo("saveScreenshot:complete", { packetId, stepNumber, s3Key });
      return s3Key;
    } catch (error) {
      this.logError("saveScreenshot:failed", error, { packetId, stepNumber });
      throw new Error(
        `Failed to save screenshot for packet ${packetId}: ${this.errorMessage(error)}`
      );
    }
  }

  async getEvidenceForCandidate(candidateId: string): Promise<EvidencePacket[]> {
    try {
      this.logInfo("getEvidenceForCandidate:start", { candidateId });

      const rows = await db
        .select({
          packet: schema.evidencePackets,
          claim: schema.claims,
        })
        .from(schema.evidencePackets)
        .leftJoin(schema.claims, eq(schema.claims.id, schema.evidencePackets.claimId))
        .where(eq(schema.evidencePackets.candidateId, candidateId))
        .orderBy(desc(schema.evidencePackets.createdAt));

      const packets = rows.map((row) =>
        this.toEvidencePacket(row.packet, row.claim)
      );

      this.logInfo("getEvidenceForCandidate:complete", {
        candidateId,
        count: packets.length,
      });
      return packets;
    } catch (error) {
      this.logError("getEvidenceForCandidate:failed", error, { candidateId });
      throw new Error(
        `Failed to get evidence for candidate ${candidateId}: ${this.errorMessage(error)}`
      );
    }
  }

  async getEvidenceForClaim(claimId: string): Promise<EvidencePacket[]> {
    try {
      this.logInfo("getEvidenceForClaim:start", { claimId });

      const rows = await db
        .select({
          packet: schema.evidencePackets,
          claim: schema.claims,
        })
        .from(schema.evidencePackets)
        .leftJoin(schema.claims, eq(schema.claims.id, schema.evidencePackets.claimId))
        .where(eq(schema.evidencePackets.claimId, claimId))
        .orderBy(desc(schema.evidencePackets.createdAt));

      const packets = rows.map((row) =>
        this.toEvidencePacket(row.packet, row.claim)
      );

      this.logInfo("getEvidenceForClaim:complete", {
        claimId,
        count: packets.length,
      });
      return packets;
    } catch (error) {
      this.logError("getEvidenceForClaim:failed", error, { claimId });
      throw new Error(
        `Failed to get evidence for claim ${claimId}: ${this.errorMessage(error)}`
      );
    }
  }

  async updatePacketVerdict(
    packetId: string,
    verdict: ClaimVerdict,
    confidence: number
  ): Promise<void> {
    try {
      this.logInfo("updatePacketVerdict:start", {
        packetId,
        verdict,
        confidence,
      });

      await db
        .update(schema.evidencePackets)
        .set({ verdict, confidence })
        .where(eq(schema.evidencePackets.id, packetId));

      this.logInfo("updatePacketVerdict:complete", { packetId });
    } catch (error) {
      this.logError("updatePacketVerdict:failed", error, { packetId });
      throw new Error(
        `Failed to update verdict for packet ${packetId}: ${this.errorMessage(error)}`
      );
    }
  }

  async saveShippedWorkItem(
    item: ShippedWorkItem,
    candidateId: string,
    packetId: string
  ): Promise<string> {
    try {
      this.logInfo("saveShippedWorkItem:start", {
        candidateId,
        packetId,
        title: item.title,
      });

      const [row] = await db
        .insert(schema.shippedWorkItems)
        .values({
          candidateId,
          packetId,
          title: item.title,
          description: item.description,
          technologies: item.technologies,
          sourceUrl: item.sourceUrl,
          demoUrl: item.demoUrl ?? null,
          githubUrl: item.githubUrl ?? null,
          hasLiveDemo: item.hasLiveDemo,
          relevanceToRole: item.relevanceToRole,
          technicalDepth: item.technicalDepth,
          recency: item.recency ?? null,
          screenshotKeys: item.evidenceScreenshots,
        })
        .returning({ id: schema.shippedWorkItems.id });

      if (!row) {
        throw new Error("No shipped work item id returned");
      }

      this.logInfo("saveShippedWorkItem:complete", {
        candidateId,
        packetId,
        itemId: row.id,
      });
      return row.id;
    } catch (error) {
      this.logError("saveShippedWorkItem:failed", error, {
        candidateId,
        packetId,
      });
      throw new Error(
        `Failed to save shipped work item for candidate ${candidateId}: ${this.errorMessage(error)}`
      );
    }
  }

  async getShippedWorkForCandidate(
    candidateId: string
  ): Promise<ShippedWorkItem[]> {
    try {
      this.logInfo("getShippedWorkForCandidate:start", { candidateId });

      const rows = await db
        .select()
        .from(schema.shippedWorkItems)
        .where(eq(schema.shippedWorkItems.candidateId, candidateId))
        .orderBy(desc(schema.shippedWorkItems.createdAt));

      const items = rows.map((row) => ({
        title: row.title,
        description: row.description,
        technologies: row.technologies,
        sourceUrl: row.sourceUrl,
        demoUrl: row.demoUrl ?? undefined,
        githubUrl: row.githubUrl ?? undefined,
        hasLiveDemo: row.hasLiveDemo,
        relevanceToRole: row.relevanceToRole,
        technicalDepth: row.technicalDepth,
        recency: row.recency ?? undefined,
        evidenceScreenshots: row.screenshotKeys,
      }));

      this.logInfo("getShippedWorkForCandidate:complete", {
        candidateId,
        count: items.length,
      });
      return items;
    } catch (error) {
      this.logError("getShippedWorkForCandidate:failed", error, { candidateId });
      throw new Error(
        `Failed to get shipped work for candidate ${candidateId}: ${this.errorMessage(error)}`
      );
    }
  }

  async createAnalysisRun(candidateId: string, jobId: string): Promise<string> {
    try {
      this.logInfo("createAnalysisRun:start", { candidateId, jobId });

      const [row] = await db
        .insert(schema.analysisRuns)
        .values({
          candidateId,
          jobId,
          status: "running",
          stepsLog: [],
        })
        .returning({ id: schema.analysisRuns.id });

      if (!row) {
        throw new Error("No analysis run id returned");
      }

      this.logInfo("createAnalysisRun:complete", {
        candidateId,
        jobId,
        runId: row.id,
      });
      return row.id;
    } catch (error) {
      this.logError("createAnalysisRun:failed", error, { candidateId, jobId });
      throw new Error(
        `Failed to create analysis run for candidate ${candidateId}: ${this.errorMessage(error)}`
      );
    }
  }

  async completeAnalysisRun(runId: string, costUsd: number): Promise<void> {
    try {
      this.logInfo("completeAnalysisRun:start", { runId, costUsd });

      await db
        .update(schema.analysisRuns)
        .set({
          status: "complete",
          completedAt: new Date(),
          totalCostUsd: costUsd,
          errorMessage: null,
        })
        .where(eq(schema.analysisRuns.id, runId));

      this.logInfo("completeAnalysisRun:complete", { runId });
    } catch (error) {
      this.logError("completeAnalysisRun:failed", error, { runId });
      throw new Error(
        `Failed to complete analysis run ${runId}: ${this.errorMessage(error)}`
      );
    }
  }

  async failAnalysisRun(runId: string, errorMessage: string): Promise<void> {
    try {
      this.logInfo("failAnalysisRun:start", { runId });

      await db
        .update(schema.analysisRuns)
        .set({
          status: "failed",
          completedAt: new Date(),
          errorMessage,
        })
        .where(eq(schema.analysisRuns.id, runId));

      this.logInfo("failAnalysisRun:complete", { runId });
    } catch (error) {
      this.logError("failAnalysisRun:failed", error, { runId });
      throw new Error(
        `Failed to mark analysis run ${runId} failed: ${this.errorMessage(error)}`
      );
    }
  }

  private async uploadEvidenceScreenshots(
    evidence: Evidence[],
    packetId: string
  ): Promise<{ evidence: Evidence[]; screenshots: ScreenshotRecord[] }> {
    const screenshots: ScreenshotRecord[] = [];
    const normalizedEvidence: Evidence[] = [];

    for (const [index, item] of evidence.entries()) {
      const evidenceItem = { ...item } as EvidenceWithScreenshotBuffer;
      const screenshot = evidenceItem.screenshotBuffer ?? evidenceItem.screenshot;
      delete evidenceItem.screenshotBuffer;
      delete evidenceItem.screenshot;

      if (screenshot) {
        const stepNumber = evidenceItem.stepNumber ?? index + 1;
        const pageUrl = evidenceItem.pageUrl ?? evidenceItem.sourceUrl;
        const s3Key = await this.uploadScreenshotBuffer(
          screenshot,
          packetId,
          stepNumber
        );

        evidenceItem.screenshotS3Key = s3Key;
        screenshots.push({ packetId, s3Key, pageUrl, stepNumber });
      }

      delete evidenceItem.stepNumber;
      delete evidenceItem.pageUrl;
      normalizedEvidence.push(evidenceItem);
    }

    return { evidence: normalizedEvidence, screenshots };
  }

  private async uploadProvenanceScreenshots(
    provenance: ProvenanceLog[],
    packetId: string
  ): Promise<{ provenance: ProvenanceLog[]; screenshots: ScreenshotRecord[] }> {
    const screenshots: ScreenshotRecord[] = [];
    const normalizedProvenance: ProvenanceLog[] = [];

    for (const item of provenance) {
      const provenanceItem = { ...item } as ProvenanceWithScreenshotBuffer;
      const screenshot =
        provenanceItem.screenshotBuffer ?? provenanceItem.screenshot;
      delete provenanceItem.screenshotBuffer;
      delete provenanceItem.screenshot;

      if (screenshot) {
        const s3Key = await this.uploadScreenshotBuffer(
          screenshot,
          packetId,
          provenanceItem.step
        );

        provenanceItem.screenshotS3Key = s3Key;
        screenshots.push({
          packetId,
          s3Key,
          pageUrl: provenanceItem.url,
          stepNumber: provenanceItem.step,
        });
      }

      normalizedProvenance.push(provenanceItem);
    }

    return { provenance: normalizedProvenance, screenshots };
  }

  private async insertScreenshotRecords(
    screenshots: ScreenshotRecord[]
  ): Promise<void> {
    if (screenshots.length === 0) {
      return;
    }

    await db.insert(schema.evidenceScreenshots).values(screenshots);
  }

  private async uploadScreenshotBuffer(
    screenshot: Buffer,
    packetId: string,
    stepNumber: number
  ): Promise<string> {
    const uploadedUrl = await uploadScreenshotToR2(
      screenshot,
      packetId,
      stepNumber
    );

    return this.extractS3Key(uploadedUrl);
  }

  private toEvidencePacket(
    packet: typeof schema.evidencePackets.$inferSelect,
    claim: typeof schema.claims.$inferSelect | null
  ): EvidencePacket {
    return {
      id: packet.id,
      candidateId: packet.candidateId,
      claimId: packet.claimId,
      claimText: claim?.text ?? "",
      claimType: claim?.type ?? "skill",
      agentType: packet.agentType,
      retrievalMode: packet.retrievalMode,
      verdict: packet.verdict,
      confidence: packet.confidence,
      evidence: packet.evidence,
      provenance: packet.provenance,
      shippedWork: packet.shippedWork ?? undefined,
      visitedUrls: packet.visitedUrls,
      totalSteps: packet.totalSteps,
      visionCallCount: packet.visionCallCount,
      costUSD: packet.costUsd,
      createdAt: packet.createdAt,
    };
  }

  private extractS3Key(uploadedUrl: string): string {
    try {
      const url = new URL(uploadedUrl);
      return url.pathname.replace(/^\//, "");
    } catch {
      return uploadedUrl;
    }
  }

  private logInfo(event: string, metadata: Record<string, unknown>): void {
    console.info("[EvidenceStore]", { event, ...metadata });
  }

  private logError(
    event: string,
    error: unknown,
    metadata: Record<string, unknown>
  ): void {
    console.error("[EvidenceStore]", {
      event,
      error: this.errorMessage(error),
      ...metadata,
    });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown error";
  }
}

export const evidenceStore = new EvidenceStore();
