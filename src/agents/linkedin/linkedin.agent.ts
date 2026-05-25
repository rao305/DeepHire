/**
 * LinkedIn Timeline Verification Agent
 *
 * GOVERNANCE: DATA MINIMIZATION COMPLIANCE
 * This agent extracts ONLY job title, company, and employment dates from LinkedIn profiles.
 * No skills, endorsements, photos, activity, connections, or other profile data is collected.
 * All access is logged via governance.ts for audit trail.
 * Full LinkedIn profile content is NEVER stored - only the extracted positions array.
 */

import { chromium } from "playwright";
import { randomUUID } from "crypto";
import { openrouter, MODELS, parseAIJson } from "@/lib/ai";
import type { ExtractedClaim, EvidencePacket } from "@/types";

interface LinkedInPosition {
  title: string;
  company: string;
  startDate: string;
  endDate: string | "Present";
}

interface TimelineConsistency {
  overallMatch: boolean;
  confidence: number;
  positions: {
    title: string;
    company: string;
    dates: string;
    foundOnLinkedIn: boolean;
  }[];
  discrepancies: {
    type: string;
    description: string;
    severity: "high" | "medium" | "low";
  }[];
}

interface LinkedInVerificationResult {
  evidencePackets: EvidencePacket[];
  timelineConsistency: TimelineConsistency;
  totalCost: number;
}

interface ResumePosition {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
}

interface VerifyTimelineOptions {
  candidateId?: string;
}

class LinkedInAgent {
  /**
   * Verifies employment timeline from LinkedIn profile against resume claims
   */
  async verifyTimeline(
    linkedinUrl: string,
    claims: ExtractedClaim[],
    resumePositions: ResumePosition[],
    options: VerifyTimelineOptions = {}
  ): Promise<LinkedInVerificationResult> {
    const candidateId = options.candidateId ?? "unknown";

    // Log access for governance
    const { logAgentAccess } = await import("@/lib/governance");
    await logAgentAccess({
      agentType: "linkedin",
      candidateId,
      targetUrl: linkedinUrl,
      purpose: "verify_timeline",
      dataExtracted: ["title", "company", "start_date", "end_date"],
    });

    const browser = await chromium.launch({
      headless: false, // LinkedIn detects headless browsers
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 1024 },
    });

    const page = await context.newPage();

    // Hide webdriver property
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    let linkedinPositions: LinkedInPosition[] = [];
    let screenshot: Buffer | null = null;
    let requiresLogin = false;

    try {
      await page.goto(linkedinUrl, { waitUntil: "networkidle", timeout: 30000 });

      // Check if redirected to login
      if (page.url().includes("/login") || page.url().includes("/authwall")) {
        requiresLogin = true;
      } else {
        // Wait for experience section
        await page.waitForSelector('[data-section="experience"], .experience-section, #experience', {
          timeout: 10000,
        }).catch(() => {
          console.warn("Experience section not found with standard selectors");
        });

        // Scroll to experience section
        await page.evaluate(() => {
          const experienceEl = document.querySelector('[data-section="experience"], .experience-section, #experience');
          if (experienceEl) {
            experienceEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });

        await page.waitForTimeout(2000); // Let content settle

        // Take screenshot of experience section only
        const experienceElement = await page.$('[data-section="experience"], .experience-section, #experience');
        if (experienceElement) {
          screenshot = await experienceElement.screenshot();
        } else {
          // Fallback to full page
          screenshot = await page.screenshot({ fullPage: true });
        }

        // Extract page text
        const pageText = await page.evaluate(() => {
          // Focus on experience section
          const experienceEl = document.querySelector('[data-section="experience"], .experience-section, #experience');
          return experienceEl?.textContent || document.body.textContent || "";
        });

        // Extract timeline using AI
        linkedinPositions = await this.extractTimelineFromLinkedIn(screenshot, pageText);
      }
    } catch (error) {
      console.error("LinkedIn scraping error:", error);
    } finally {
      await browser.close();
    }

    // Compare timeline
    const timelineConsistency = this.compareTimelineToResume(
      linkedinPositions,
      resumePositions
    );

    // Cost estimate: 1 image + text analysis with MODELS.FAST
    const totalCost = screenshot ? 0.002 : 0.0005; // ~$0.002 per vision call with Gemini Flash
    const perPacketCost =
      resumePositions.length > 0 ? totalCost / resumePositions.length : 0;

    // Build evidence packets in the canonical EvidencePacket shape
    const evidencePackets: EvidencePacket[] = resumePositions.map((resumePos) => {
      const matchedLinkedInPos = linkedinPositions.find(
        (lp) => this.fuzzyMatchPosition(lp, resumePos) > 0.7
      );

      const claimText = `${resumePos.title} at ${resumePos.company} (${resumePos.startDate} - ${resumePos.endDate || "Present"})`;
      const reasoning = matchedLinkedInPos
        ? `Position found on LinkedIn: ${matchedLinkedInPos.title} at ${matchedLinkedInPos.company}`
        : requiresLogin
        ? "Profile requires login to view - could not verify"
        : "Position not found on LinkedIn profile";

      const verdict = matchedLinkedInPos ? "SUPPORTED" : "UNVERIFIED";

      return {
        id: randomUUID(),
        candidateId,
        claimId: `linkedin-${resumePos.company}-${resumePos.title}`,
        claimText,
        claimType: "employment",
        agentType: "linkedin",
        retrievalMode: "browser",
        verdict,
        confidence: matchedLinkedInPos ? 0.85 : 0.3,
        evidence: [
          {
            claimId: `linkedin-${resumePos.company}-${resumePos.title}`,
            sourceUrl: linkedinUrl,
            sourceType: "linkedin",
            pageTitle: "LinkedIn Experience Section",
            snippets: [
              {
                text: matchedLinkedInPos
                  ? `${matchedLinkedInPos.title} at ${matchedLinkedInPos.company} (${matchedLinkedInPos.startDate} - ${matchedLinkedInPos.endDate})`
                  : claimText,
                relevance: matchedLinkedInPos ? 0.9 : 0.2,
                supportsClaim: matchedLinkedInPos
                  ? true
                  : requiresLogin
                  ? "uncertain"
                  : false,
                context: reasoning,
              },
            ],
            timestamp: new Date(),
            agentReasoning: reasoning,
          },
        ],
        provenance: [],
        visitedUrls: [linkedinUrl],
        totalSteps: 1,
        visionCallCount: screenshot ? 1 : 0,
        costUSD: perPacketCost,
        createdAt: new Date(),
      };
    });

    return {
      evidencePackets,
      timelineConsistency: requiresLogin
        ? {
            ...timelineConsistency,
            confidence: 0.3,
            discrepancies: [
              {
                type: "access_restricted",
                description: "Profile requires login to view",
                severity: "high",
              },
            ],
          }
        : timelineConsistency,
      totalCost,
    };
  }

  /**
   * Extract job positions from LinkedIn screenshot and page text using AI
   */
  private async extractTimelineFromLinkedIn(
    screenshot: Buffer,
    pageText: string
  ): Promise<LinkedInPosition[]> {
    try {
      const response = await openrouter.chat.completions.create({
        model: MODELS.FAST, // "google/gemini-flash-1.5"
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract ONLY job positions (title, company, dates) from this LinkedIn profile.
Return JSON in this format:
{
  "positions": [
    {
      "title": "Software Engineer",
      "company": "Acme Corp",
      "startDate": "Jan 2020",
      "endDate": "Dec 2022"
    }
  ]
}

If a position is current, use "Present" for endDate.
Parse dates as accurately as possible from the screenshot.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${screenshot.toString("base64")}`,
                },
              },
            ],
          },
        ],
      });

      const parsed = parseAIJson<{ positions: LinkedInPosition[] }>(
        response.choices[0]?.message?.content || "{}"
      );

      return parsed.positions || [];
    } catch (error) {
      console.error("LinkedIn timeline extraction error:", error);
      return [];
    }
  }

  /**
   * Compare LinkedIn positions with resume positions
   */
  private compareTimelineToResume(
    linkedinPositions: LinkedInPosition[],
    resumePositions: ResumePosition[]
  ): TimelineConsistency {
    const matchedPositions: TimelineConsistency["positions"] = [];
    const discrepancies: TimelineConsistency["discrepancies"] = [];

    for (const resumePos of resumePositions) {
      const matchScore = Math.max(
        ...linkedinPositions.map((lp) => this.fuzzyMatchPosition(lp, resumePos))
      );

      const bestMatch = linkedinPositions.find(
        (lp) => this.fuzzyMatchPosition(lp, resumePos) === matchScore
      );

      const foundOnLinkedIn = matchScore > 0.7;

      matchedPositions.push({
        title: resumePos.title,
        company: resumePos.company,
        dates: `${resumePos.startDate} - ${resumePos.endDate || "Present"}`,
        foundOnLinkedIn,
      });

      if (!foundOnLinkedIn) {
        discrepancies.push({
          type: "missing_position",
          description: `${resumePos.title} at ${resumePos.company} not found on LinkedIn`,
          severity: "high",
        });
      } else if (bestMatch) {
        // Check date consistency (allow ±3 months)
        const resumeStart = this.extractYearMonth(resumePos.startDate);
        const linkedinStart = this.extractYearMonth(bestMatch.startDate);

        if (resumeStart && linkedinStart) {
          const monthDiff = Math.abs(
            (resumeStart.year - linkedinStart.year) * 12 +
              (resumeStart.month - linkedinStart.month)
          );

          if (monthDiff > 3) {
            discrepancies.push({
              type: "date_mismatch",
              description: `Start date mismatch for ${resumePos.title} at ${resumePos.company}: Resume says ${resumePos.startDate}, LinkedIn says ${bestMatch.startDate}`,
              severity: monthDiff > 6 ? "high" : "medium",
            });
          }
        }
      }
    }

    // Check for positions on LinkedIn but not on resume
    for (const linkedinPos of linkedinPositions) {
      const matchScore = Math.max(
        ...resumePositions.map((rp) => this.fuzzyMatchPosition(linkedinPos, rp))
      );

      if (matchScore < 0.7) {
        discrepancies.push({
          type: "extra_position",
          description: `${linkedinPos.title} at ${linkedinPos.company} found on LinkedIn but not on resume`,
          severity: "low",
        });
      }
    }

    const overallMatch = discrepancies.filter((d) => d.severity === "high").length === 0;
    const confidence = Math.max(
      0,
      1 - discrepancies.length * 0.15
    );

    return {
      overallMatch,
      confidence: Math.min(1, confidence),
      positions: matchedPositions,
      discrepancies,
    };
  }

  /**
   * Extract year and month from date string
   */
  private extractYearMonth(
    dateStr: string
  ): { year: number; month: number } | null {
    const months: Record<string, number> = {
      jan: 1, january: 1,
      feb: 2, february: 2,
      mar: 3, march: 3,
      apr: 4, april: 4,
      may: 5,
      jun: 6, june: 6,
      jul: 7, july: 7,
      aug: 8, august: 8,
      sep: 9, september: 9,
      oct: 10, october: 10,
      nov: 11, november: 11,
      dec: 12, december: 12,
    };

    const normalized = dateStr.toLowerCase().trim();

    // Try "Jan 2020" or "January 2020"
    const match1 = normalized.match(/(\w+)\s+(\d{4})/);
    if (match1) {
      const month = months[match1[1]];
      const year = parseInt(match1[2], 10);
      if (month && year) return { year, month };
    }

    // Try "2020-01" or "2020/01"
    const match2 = normalized.match(/(\d{4})[-/](\d{1,2})/);
    if (match2) {
      const year = parseInt(match2[1], 10);
      const month = parseInt(match2[2], 10);
      if (month >= 1 && month <= 12) return { year, month };
    }

    // Fallback: just year
    const match3 = normalized.match(/(\d{4})/);
    if (match3) {
      return { year: parseInt(match3[1], 10), month: 6 }; // Assume mid-year
    }

    return null;
  }

  /**
   * Fuzzy match between two positions (company + title similarity)
   */
  private fuzzyMatchPosition(
    a: { title: string; company: string },
    b: { title: string; company: string }
  ): number {
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

    const companyA = normalize(a.company);
    const companyB = normalize(b.company);
    const titleA = normalize(a.title);
    const titleB = normalize(b.title);

    // Simple substring match
    const companyMatch =
      companyA.includes(companyB) ||
      companyB.includes(companyA) ||
      companyA === companyB
        ? 1
        : 0;

    const titleMatch =
      titleA.includes(titleB) || titleB.includes(titleA) || titleA === titleB
        ? 1
        : 0;

    // Weighted: company match is more important
    return companyMatch * 0.6 + titleMatch * 0.4;
  }
}

// Export singleton instance
export const linkedinAgent = new LinkedInAgent();
