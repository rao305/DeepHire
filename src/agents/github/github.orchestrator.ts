import { randomUUID } from "crypto";
import { EvidenceStore } from "@/agents/evidence/evidence-store";
import type { PrioritizedVerificationPlan } from "@/agents/claim-prioritizer.agent";
import type {
  ClaimVerdict,
  Evidence,
  EvidencePacket,
  ExtractedClaim,
  JobRubric,
  ShippedWorkItem,
} from "@/types";
import {
  GitHubAPIAgent,
  type GitHubProfile,
  type Repository,
} from "./github-api.agent";
import { GitHubBrowserAgent } from "./github-browser.agent";

interface RepositoryWithAuthorship extends Repository {
  isPrimaryAuthor?: boolean;
}

export interface GitHubVerificationResult {
  evidencePackets: EvidencePacket[];
  shippedWork: ShippedWorkItem[];
  candidateProfile: GitHubProfile;
  topRepositories: Repository[];
  totalCost: number;
  summary: {
    claimsVerified: number;
    claimsSupported: number;
    claimsWeaklySupported: number;
    claimsUnverified: number;
    bestRepo: string;
    primaryLanguages: string[];
  };
}

export class GitHubOrchestrator {
  private readonly apiAgent = new GitHubAPIAgent();
  private readonly browserAgent = new GitHubBrowserAgent();
  private readonly evidenceStore = new EvidenceStore();

  async verifyCandidateOnGitHub(
    candidateId: string,
    githubUrl: string,
    claims: ExtractedClaim[],
    jobRubric: JobRubric,
    verificationPlan: PrioritizedVerificationPlan,
    analysisRunId: string
  ): Promise<GitHubVerificationResult> {
    void analysisRunId;

    const username = await this.apiAgent.extractUsernameFromUrl(githubUrl);
    if (!username) {
      throw new Error(`Invalid GitHub URL: ${githubUrl}`);
    }

    const [candidateProfile, repositories] = await Promise.all([
      this.apiAgent.getUserProfile(username),
      this.apiAgent.getUserRepositories(username),
    ]);
    const highPriorityClaims = this.getHighPriorityClaims(claims, verificationPlan);
    const evidencePackets: EvidencePacket[] = [];
    let totalCost = 0;

    for (const task of verificationPlan.highPriority) {
      const claim = task.claim;
      const relevantRepos = await this.apiAgent.findReposForClaim(username, claim);
      const topRepos = relevantRepos.slice(0, 2);
      const apiConfidence = this.calculateAPIOnlyConfidence(claim, relevantRepos);
      const packetId = randomUUID();
      let packetConfidence = apiConfidence;
      let retrievalMode: EvidencePacket["retrievalMode"] = "api";
      let packetEvidence = this.createApiEvidence(claim, relevantRepos, apiConfidence);
      let provenance = [
        {
          step: 1,
          action: "github_api_repository_match",
          url: githubUrl,
          timestamp: new Date(),
          reasoning: `Matched ${relevantRepos.length} repositories for claim keywords.`,
        },
      ];
      let visitedUrls = topRepos.map((repo) => repo.url);
      let totalSteps = 1;
      let visionCallCount = 0;
      let packetCost = task.estimatedCost;

      if (this.shouldRunBrowserAgent(claim, apiConfidence)) {
        const browserEvidence = await this.browserAgent.verifyClaim(
          username,
          claim,
          topRepos,
          task.budget,
          packetId
        );

        retrievalMode = "hybrid";
        packetEvidence = [...packetEvidence, ...browserEvidence.evidence];
        provenance = [
          ...provenance,
          {
            step: 2,
            action: "github_browser_inspection",
            url: topRepos[0]?.url ?? githubUrl,
            timestamp: new Date(),
            reasoning: `Browser inspection collected ${browserEvidence.evidence.length} evidence items.`,
          },
        ];
        visitedUrls = [...new Set([...visitedUrls, ...browserEvidence.visitedUrls])];
        totalSteps += browserEvidence.totalSteps;
        visionCallCount += browserEvidence.visionCallCount;
        packetConfidence = Math.min(
          1,
          apiConfidence + (browserEvidence.evidence.length > 0 ? 0.2 : 0)
        );
        packetCost += 0.01;
      }

      const packet: EvidencePacket = {
        id: packetId,
        candidateId,
        claimId: claim.id,
        claimText: claim.text,
        claimType: claim.type,
        agentType: "github_api",
        retrievalMode,
        verdict: this.verdictForConfidence(packetConfidence),
        confidence: packetConfidence,
        evidence: packetEvidence,
        provenance,
        visitedUrls,
        totalSteps,
        visionCallCount,
        costUSD: packetCost,
      };

      await this.evidenceStore.saveEvidencePacket(packet);
      evidencePackets.push(packet);
      totalCost += packetCost;
    }

    const shippedWorkPacketId = evidencePackets[0]?.id ?? randomUUID();
    const shippedWork = await this.discoverShippedWork(
      username,
      repositories,
      jobRubric,
      shippedWorkPacketId
    );
    const topRepositories = this.sortRepositoriesByStrength(repositories).slice(0, 5);

    return {
      evidencePackets,
      shippedWork,
      candidateProfile,
      topRepositories,
      totalCost,
      summary: {
        claimsVerified: highPriorityClaims.length,
        claimsSupported: evidencePackets.filter(
          (packet) => packet.verdict === "SUPPORTED"
        ).length,
        claimsWeaklySupported: evidencePackets.filter(
          (packet) => packet.verdict === "WEAKLY_SUPPORTED"
        ).length,
        claimsUnverified: evidencePackets.filter(
          (packet) => packet.verdict === "UNVERIFIED"
        ).length,
        bestRepo: topRepositories[0]?.name ?? "",
        primaryLanguages: candidateProfile.topLanguages,
      },
    };
  }

  async discoverShippedWork(
    username: string,
    repositories: Repository[],
    jobRubric: JobRubric,
    packetId: string
  ): Promise<ShippedWorkItem[]> {
    void packetId;

    const scoredRepos = await Promise.all(
      repositories.map(async (repo) => {
        const commitActivity = await this.apiAgent
          .analyzeCommitActivity(username, repo.name)
          .catch(() => null);
        const enrichedRepo: RepositoryWithAuthorship = {
          ...repo,
          userCommitCount: commitActivity?.userCommits ?? repo.userCommitCount,
          isPrimaryAuthor: commitActivity?.isPrimaryAuthor ?? false,
        };

        return {
          repo: enrichedRepo,
          score: this.scoreShippedWorkRepo(enrichedRepo, jobRubric),
        };
      })
    );

    const topRepos = scoredRepos
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const shippedWorkItems: ShippedWorkItem[] = [];

    for (const { repo, score } of topRepos) {
      const readme = await this.apiAgent.getRepositoryReadme(username, repo.name);
      const item: ShippedWorkItem = {
        title: repo.name,
        description:
          repo.description ??
          this.summarizeReadme(readme) ??
          `${repo.name} GitHub repository`,
        technologies: this.repositoryTechnologies(repo),
        sourceUrl: repo.url,
        demoUrl: undefined,
        githubUrl: repo.url,
        hasLiveDemo: false,
        relevanceToRole: Math.min(score / 100, 1),
        technicalDepth: this.calculateTechnicalDepth(repo),
        recency: repo.updatedAt ? repo.updatedAt.slice(0, 10) : undefined,
        evidenceScreenshots: [],
      };

      shippedWorkItems.push(item);
    }

    return shippedWorkItems;
  }

  private calculateAPIOnlyConfidence(
    claim: ExtractedClaim,
    repositories: Repository[]
  ): number {
    if (repositories.length === 0) {
      return 0;
    }

    const keywords = claim.keywords.map((keyword) => keyword.toLowerCase());
    const bestScore = repositories.reduce((best, repo) => {
      const searchable = [
        repo.name,
        repo.description ?? "",
        repo.language ?? "",
        ...repo.topics,
        ...Object.keys(repo.languages),
      ]
        .join(" ")
        .toLowerCase();
      const matches = keywords.filter((keyword) => searchable.includes(keyword));
      const repoScore =
        matches.length / Math.max(keywords.length, 1) +
        (repo.hasDeploymentFiles && claim.type === "deployment" ? 0.25 : 0) +
        (repo.stars > 0 ? 0.1 : 0);

      return Math.max(best, repoScore);
    }, 0);

    return Math.min(bestScore, 1);
  }

  private shouldRunBrowserAgent(
    claim: ExtractedClaim,
    apiConfidence: number
  ): boolean {
    return (
      ["scale", "deployment", "project", "ownership"].includes(claim.type) &&
      apiConfidence < 0.75
    );
  }

  private createApiEvidence(
    claim: ExtractedClaim,
    repositories: Repository[],
    confidence: number
  ): Evidence[] {
    if (repositories.length === 0) {
      return [];
    }

    return [
      {
        claimId: claim.id,
        sourceUrl: repositories[0].url,
        sourceType: "github_api",
        pageTitle: repositories[0].fullName,
        snippets: repositories.slice(0, 3).map((repo) => ({
          text: `${repo.fullName}: ${repo.description ?? "No description"} (${[
            repo.language,
            ...repo.topics,
          ]
            .filter(Boolean)
            .join(", ")})`,
          relevance: confidence,
          supportsClaim: confidence >= 0.75 ? true : "uncertain",
          context: "GitHub REST API repository metadata",
        })),
        timestamp: new Date(),
        agentReasoning: "Matched claim keywords against repository metadata.",
      },
    ];
  }

  private verdictForConfidence(confidence: number): ClaimVerdict {
    if (confidence >= 0.75) return "SUPPORTED";
    if (confidence >= 0.4) return "WEAKLY_SUPPORTED";
    return "UNVERIFIED";
  }

  private scoreShippedWorkRepo(
    repo: RepositoryWithAuthorship,
    jobRubric: JobRubric
  ): number {
    let score = 0;

    if (repo.stars > 50) score += 30;
    else if (repo.stars > 10) score += 20;
    else if (repo.stars > 0) score += 10;

    if (repo.hasDeploymentFiles) score += 25;
    if (this.matchesMustHaveSkills(repo, jobRubric)) score += 30;

    const monthsSinceUpdate = this.monthsSince(repo.updatedAt);
    if (monthsSinceUpdate < 6) score += 20;
    else if (monthsSinceUpdate < 24) score += 10;

    if ((repo.userCommitCount ?? 0) > 50) score += 15;
    if (repo.isPrimaryAuthor) score += 20;

    return score;
  }

  private sortRepositoriesByStrength(repositories: Repository[]): Repository[] {
    return [...repositories].sort((a, b) => {
      const bScore = b.stars * 2 + b.forks + (b.hasDeploymentFiles ? 25 : 0);
      const aScore = a.stars * 2 + a.forks + (a.hasDeploymentFiles ? 25 : 0);
      return bScore - aScore;
    });
  }

  private matchesMustHaveSkills(repo: Repository, jobRubric: JobRubric): boolean {
    const repoTerms = [
      repo.language ?? "",
      ...repo.topics,
      ...Object.keys(repo.languages),
      repo.name,
      repo.description ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return jobRubric.mustHaveSkills.some((skill) =>
      repoTerms.includes(skill.toLowerCase())
    );
  }

  private monthsSince(dateValue: string): number {
    const timestamp = new Date(dateValue).getTime();
    if (Number.isNaN(timestamp)) {
      return Number.POSITIVE_INFINITY;
    }

    return (Date.now() - timestamp) / (1000 * 60 * 60 * 24 * 30);
  }

  private repositoryTechnologies(repo: Repository): string[] {
    return [
      repo.language,
      ...Object.keys(repo.languages),
      ...repo.topics,
    ].filter((technology): technology is string => Boolean(technology));
  }

  private calculateTechnicalDepth(repo: Repository): number {
    const languageCount = Object.keys(repo.languages).length;
    const sizeScore = Math.min(repo.size / 5000, 0.4);
    const languageScore = Math.min(languageCount * 0.1, 0.3);
    const deploymentScore = repo.hasDeploymentFiles ? 0.3 : 0;

    return Math.min(sizeScore + languageScore + deploymentScore, 1);
  }

  private summarizeReadme(readme: string | null): string | undefined {
    if (!readme) {
      return undefined;
    }

    return readme
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 40 && !line.startsWith("#"))
      ?.slice(0, 240);
  }

  private getHighPriorityClaims(
    claims: ExtractedClaim[],
    verificationPlan: PrioritizedVerificationPlan
  ): ExtractedClaim[] {
    const highPriorityIds = new Set(
      verificationPlan.highPriority.map((task) => task.claim.id)
    );

    return claims.filter((claim) => highPriorityIds.has(claim.id));
  }

}

export const githubOrchestrator = new GitHubOrchestrator();

export { GitHubOrchestrator as GithubOrchestrator };
