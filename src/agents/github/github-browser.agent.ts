import { chromium } from "playwright";
import { visionPlanner } from "@/agents/vision-planner";
import { uploadScreenshotToR2 } from "@/lib/r2";
import { MODELS } from "@/lib/ai";
import type {
  AgentAction,
  AgentContext,
  Evidence,
  ExtractedClaim,
  RetrievalBudget,
} from "@/types";
import type { Repository } from "./github-api.agent";

const ALLOWED_DOMAINS = ["github.com", "raw.githubusercontent.com"] as const;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

interface LegacyAgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BrowserEvidence {
  evidence: Evidence[];
  visitedUrls: string[];
  totalSteps: number;
  visionCallCount: number;
  screenshotKeys: string[];
  foundDemoUrl?: string;
  foundDeploymentConfig: boolean;
  readmeQuality: "excellent" | "good" | "minimal" | "none";
}

export class GitHubBrowserAgent {
  async execute(
    username: string,
    searchTerms: string[],
    candidateId: string
  ): Promise<LegacyAgentResult<Evidence[]>> {
    try {
      const browserEvidence = await this.verifyClaim(
        username,
        {
          id: candidateId,
          type: "skill",
          text: searchTerms.join(", "),
          keywords: searchTerms,
          category: "github",
          jobRelevance: 0,
          priority: 0,
          verificationStrategy: ["github_browser"],
        },
        [],
        {
          maxSteps: Math.max(searchTerms.length, 1),
          maxTimeSeconds: 60,
          maxVisionCalls: Math.max(searchTerms.length, 1),
          minEvidenceThreshold: 0,
        },
        candidateId
      );

      return {
        success: true,
        data: browserEvidence.evidence,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async verifyClaim(
    username: string,
    claim: ExtractedClaim,
    repositories: Repository[],
    budget: RetrievalBudget,
    evidencePacketId: string
  ): Promise<BrowserEvidence> {
    void MODELS.FAST;

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const evidence: Evidence[] = [];
    const visitedUrls: string[] = [];
    const screenshotKeys: string[] = [];
    let totalSteps = 0;
    let visionCallCount = 0;
    let foundDemoUrl: string | undefined;
    let foundDeploymentConfig = false;
    let readmeQuality: BrowserEvidence["readmeQuality"] = "none";
    const startedAt = Date.now();

    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: USER_AGENT,
      });
      const page = await context.newPage();
      const startUrl = repositories[0]?.url ?? `https://github.com/${username}`;

      await this.safeGoto(page, startUrl);

      const persona = {
        name: "GitHub Research Agent",
        goal: `Find evidence that ${username} has experience with: ${claim.text}`,
        expertise: [
          "GitHub repos",
          "README quality",
          "code structure",
          "deployment configs",
          "commit history",
        ],
      };

      while (
        totalSteps < budget.maxSteps &&
        visionCallCount < budget.maxVisionCalls &&
        Date.now() - startedAt < budget.maxTimeSeconds * 1000
      ) {
        const currentUrl = page.url();
        this.trackVisitedUrl(visitedUrls, currentUrl);

        const screenshot = await page.screenshot({ type: "png" });
        const screenshotKey = await uploadScreenshotToR2(
          screenshot,
          evidencePacketId,
          totalSteps + 1
        );
        screenshotKeys.push(screenshotKey);

        const pageText = await this.getPageText(page);
        readmeQuality = this.bestReadmeQuality(
          readmeQuality,
          await this.assessReadmeQuality(pageText)
        );

        const deploymentEvidence = await this.findDeploymentEvidence(page);
        foundDeploymentConfig =
          foundDeploymentConfig ||
          deploymentEvidence.hasDockerfile ||
          deploymentEvidence.hasGithubActions ||
          Boolean(deploymentEvidence.deployPlatform);
        foundDemoUrl = foundDemoUrl ?? deploymentEvidence.liveUrl;

        const agentContext: AgentContext = {
          claim,
          currentUrl,
          visitedUrls,
          evidenceCollected: evidence,
          stepsTaken: totalSteps,
          timeElapsed: Math.floor((Date.now() - startedAt) / 1000),
          lastScreenshot: screenshot,
          pageText,
          budget,
        };

        const action = await visionPlanner.decideNextAction(
          agentContext,
          [...ALLOWED_DOMAINS],
          persona
        );
        visionCallCount += 1;

        const shouldContinue = await this.executeAction(
          page,
          action,
          claim,
          currentUrl,
          screenshotKey,
          evidence
        );
        totalSteps += 1;

        if (!shouldContinue) {
          break;
        }
      }

      return {
        evidence,
        visitedUrls,
        totalSteps,
        visionCallCount,
        screenshotKeys,
        foundDemoUrl,
        foundDeploymentConfig,
        readmeQuality,
      };
    } finally {
      await browser.close();
    }
  }

  async assessReadmeQuality(
    readmeText: string
  ): Promise<"excellent" | "good" | "minimal" | "none"> {
    const text = readmeText.trim();
    if (!text) {
      return "none";
    }

    const words = text.split(/\s+/).filter(Boolean);
    const lowerText = text.toLowerCase();
    const hasTechStackSection =
      /(?:^|\n)#{1,4}\s*(tech stack|technologies|built with|stack)/i.test(text) ||
      lowerText.includes("tech stack");
    const hasSetupInstructions =
      lowerText.includes("installation") ||
      lowerText.includes("getting started") ||
      lowerText.includes("setup") ||
      lowerText.includes("npm install") ||
      lowerText.includes("yarn install") ||
      lowerText.includes("pnpm install");
    const hasDemoOrScreenshot =
      lowerText.includes("demo") ||
      lowerText.includes("screenshot") ||
      /https?:\/\/\S+/.test(text);
    const hasDescription = words.length > 20;
    const hasBasicTechMention =
      /\b(react|next\.?js|node|typescript|javascript|python|docker|postgres|mongodb|aws|tailwind|graphql)\b/i.test(
        text
      );

    if (
      words.length > 500 &&
      hasTechStackSection &&
      hasSetupInstructions &&
      hasDemoOrScreenshot
    ) {
      return "excellent";
    }

    if (
      words.length >= 200 &&
      words.length <= 500 &&
      hasDescription &&
      hasBasicTechMention
    ) {
      return "good";
    }

    return "minimal";
  }

  async findDeploymentEvidence(page: any): Promise<{
    hasDockerfile: boolean;
    hasGithubActions: boolean;
    liveUrl?: string;
    deployPlatform?: string;
  }> {
    const pageText = await this.getPageText(page);
    const lowerText = pageText.toLowerCase();
    const deployPlatform = this.detectDeployPlatform(lowerText);
    const liveUrl = await page
      .evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a"));
        const liveLink = anchors.find((anchor) => {
          const text = `${anchor.textContent ?? ""} ${anchor.getAttribute("aria-label") ?? ""}`.toLowerCase();
          const href = anchor.getAttribute("href") ?? "";
          return (
            href.startsWith("http") &&
            !href.includes("github.com") &&
            (text.includes("demo") ||
              text.includes("live") ||
              text.includes("website") ||
              text.includes("app"))
          );
        });

        return liveLink?.getAttribute("href") ?? undefined;
      })
      .catch(() => undefined);

    return {
      hasDockerfile:
        lowerText.includes("dockerfile") ||
        lowerText.includes("docker-compose.yml"),
      hasGithubActions:
        lowerText.includes(".github/workflows") ||
        lowerText.includes("github actions"),
      liveUrl,
      deployPlatform,
    };
  }

  private async executeAction(
    page: any,
    action: AgentAction,
    claim: ExtractedClaim,
    sourceUrl: string,
    screenshotKey: string,
    evidence: Evidence[]
  ): Promise<boolean> {
    switch (action.type) {
      case "navigate":
        if (!action.target) return true;
        return this.safeGoto(page, action.target);
      case "click":
        if (!action.target) return true;
        await this.safeClick(page, action.target);
        return true;
      case "scroll":
        await page.mouse.wheel(0, 700).catch(() => undefined);
        return true;
      case "extract":
        evidence.push({
          claimId: claim.id,
          sourceUrl,
          sourceType: "github",
          pageTitle: await page.title().catch(() => undefined),
          snippets: action.extractedEvidence ?? [],
          screenshotS3Key: screenshotKey,
          timestamp: new Date(),
          agentReasoning: action.reasoning,
        });
        return true;
      case "done":
        return false;
      default:
        return true;
    }
  }

  private isAllowedDomain(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return ALLOWED_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  private async safeGoto(page: any, url: string): Promise<boolean> {
    try {
      const targetUrl = new URL(url, page.url() || "https://github.com").toString();
      if (!this.isAllowedDomain(targetUrl)) {
        return false;
      }

      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async safeClick(page: any, target: string): Promise<boolean> {
    try {
      const link = page.locator("a", { hasText: target }).first();
      const href = await link.getAttribute("href", { timeout: 3000 });

      if (href) {
        const targetUrl = new URL(href, page.url()).toString();
        if (!this.isAllowedDomain(targetUrl)) {
          return false;
        }
      }

      await link.click({ timeout: 5000 });
      return true;
    } catch {
      try {
        await page.getByText(target).first().click({ timeout: 5000 });
        return true;
      } catch {
        return false;
      }
    }
  }

  private async getPageText(page: any): Promise<string> {
    return page
      .evaluate(() => document.body?.innerText ?? "")
      .catch(() => "");
  }

  private trackVisitedUrl(visitedUrls: string[], url: string): void {
    if (url && this.isAllowedDomain(url) && !visitedUrls.includes(url)) {
      visitedUrls.push(url);
    }
  }

  private detectDeployPlatform(pageText: string): string | undefined {
    if (pageText.includes("vercel")) return "vercel";
    if (pageText.includes("netlify")) return "netlify";
    if (pageText.includes("render")) return "render";
    if (pageText.includes("fly.io")) return "fly.io";
    if (pageText.includes("heroku")) return "heroku";
    if (pageText.includes("cloudflare pages")) return "cloudflare_pages";
    if (pageText.includes("deploy to")) return "unknown";
    return undefined;
  }

  private bestReadmeQuality(
    current: BrowserEvidence["readmeQuality"],
    next: BrowserEvidence["readmeQuality"]
  ): BrowserEvidence["readmeQuality"] {
    const rank = {
      none: 0,
      minimal: 1,
      good: 2,
      excellent: 3,
    };

    return rank[next] > rank[current] ? next : current;
  }
}

export const githubBrowserAgent = new GitHubBrowserAgent();

export { GitHubBrowserAgent as GithubBrowserAgent };
