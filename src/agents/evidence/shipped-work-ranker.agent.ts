import { openrouter, MODELS, parseAIJson, retryWithBackoff } from "@/lib/ai";
import type { JobRubric, ShippedWorkItem } from "@/types";

export interface RankedShippedWork extends ShippedWorkItem {
  rank: number;
  deterministicScore: number;
  impressivenessScore: number;
  roleRelevanceScore: number;
  impressivenessNarrative: string;
}

export class ShippedWorkRankerAgent {
  async rankShippedWork(
    items: ShippedWorkItem[],
    jobRubric: JobRubric,
    candidateName: string
  ): Promise<RankedShippedWork[]> {
    if (items.length === 0) {
      return [];
    }

    const deterministicItems = items
      .map((item, index) => ({
        index,
        item,
        deterministicScore: this.scoreItemDeterministically(item, jobRubric),
      }))
      .sort((a, b) => b.deterministicScore - a.deterministicScore);
    const prompt = this.buildRankingPrompt(
      deterministicItems.map(({ index, item, deterministicScore }) => ({
        index,
        deterministicScore,
        item,
      })),
      jobRubric,
      candidateName
    );

    const parsed = await retryWithBackoff(async () => {
      const response = await openrouter.chat.completions.create({
        model: MODELS.QUALITY,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      });
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Empty shipped work ranking response");
      }

      return parseAIJson<{ rankedItems: RankedShippedWork[] }>(content);
    });

    return this.normalizeRankedItems(
      parsed.rankedItems,
      deterministicItems.map(({ item }) => item),
      jobRubric
    );
  }

  async writeShippedWorkNarrative(
    item: ShippedWorkItem,
    jobRubric: JobRubric
  ): Promise<string> {
    const prompt = `Write a concise 2-sentence recruiter-facing narrative explaining why this shipped project demonstrates real engineering capability for a ${jobRubric.seniority} ${jobRubric.title} role.

Role must-have skills: ${jobRubric.mustHaveSkills.join(", ")}

Project:
${JSON.stringify(item, null, 2)}

Return JSON:
{
  "narrative": "..."
}`;

    const parsed = await retryWithBackoff(async () => {
      const response = await openrouter.chat.completions.create({
        model: MODELS.QUALITY,
        max_tokens: 350,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      });
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Empty shipped work narrative response");
      }

      return parseAIJson<{ narrative: string }>(content);
    });

    return parsed.narrative;
  }

  async identifyHeroProject(
    items: RankedShippedWork[]
  ): Promise<RankedShippedWork> {
    if (items.length === 0) {
      throw new Error("Cannot identify hero project from an empty list");
    }

    return [...items].sort((a, b) => {
      const bScore =
        b.impressivenessScore + b.roleRelevanceScore + b.deterministicScore;
      const aScore =
        a.impressivenessScore + a.roleRelevanceScore + a.deterministicScore;
      return bScore - aScore;
    })[0];
  }

  scoreItemDeterministically(
    item: ShippedWorkItem,
    rubric: JobRubric
  ): number {
    let score = 0;

    if (item.hasLiveDemo) score += 30;
    if (item.relevanceToRole > 0.8) score += 25;
    if (item.technicalDepth > 0.7) score += 20;

    const technologies = item.technologies.map((technology) =>
      technology.toLowerCase()
    );
    const mustHaveMatches = rubric.mustHaveSkills.filter((skill) =>
      technologies.some((technology) =>
        technology.includes(skill.toLowerCase())
      )
    );
    score += Math.min(mustHaveMatches.length * 15, 30);

    const monthsSinceRecency = this.monthsSince(item.recency);
    if (monthsSinceRecency < 12) score += 15;
    else if (monthsSinceRecency < 24) score += 10;

    if (item.evidenceScreenshots.length > 0) score += 10;

    return Math.min(score, 100);
  }

  private buildRankingPrompt(
    items: Array<{
      index: number;
      deterministicScore: number;
      item: ShippedWorkItem;
    }>,
    jobRubric: JobRubric,
    candidateName: string
  ): string {
    return `You are evaluating shipped work for a ${jobRubric.seniority} ${jobRubric.title} role requiring ${jobRubric.mustHaveSkills.join(", ")}.
Rate each project by impressiveness and role relevance.
For each write a 2-sentence "impressivenessNarrative" explaining to a recruiter why this project demonstrates real engineering capability.

Candidate: ${candidateName}
Nice-to-have skills: ${jobRubric.niceToHaveSkills.join(", ")}
Focus areas: ${jobRubric.focusAreas.join(", ")}

Projects:
${JSON.stringify(items, null, 2)}

Return JSON:
{
  "rankedItems": [
    {
      "rank": 1,
      "title": "original project title",
      "description": "original description",
      "technologies": ["..."],
      "sourceUrl": "https://...",
      "demoUrl": "https://...",
      "githubUrl": "https://...",
      "hasLiveDemo": true,
      "relevanceToRole": 0.9,
      "technicalDepth": 0.8,
      "recency": "YYYY-MM-DD",
      "evidenceScreenshots": ["..."],
      "deterministicScore": 85,
      "impressivenessScore": 0.9,
      "roleRelevanceScore": 0.9,
      "impressivenessNarrative": "Two sentences."
    }
  ]
}`;
  }

  private normalizeRankedItems(
    rankedItems: RankedShippedWork[] | undefined,
    fallbackItems: ShippedWorkItem[],
    jobRubric: JobRubric
  ): RankedShippedWork[] {
    const itemsToRank =
      rankedItems && rankedItems.length > 0
        ? rankedItems
        : fallbackItems.map((item) => ({
            ...item,
            rank: 0,
            deterministicScore: this.scoreItemDeterministically(item, jobRubric),
            impressivenessScore: item.technicalDepth,
            roleRelevanceScore: item.relevanceToRole,
            impressivenessNarrative: `${item.title} shows shipped engineering work through ${item.technologies.join(", ") || "its implementation details"}. Its relevance and technical depth make it useful evidence for this role.`,
          }));

    return itemsToRank
      .map((item) => ({
        ...item,
        deterministicScore:
          item.deterministicScore ??
          this.scoreItemDeterministically(item, jobRubric),
        impressivenessScore: this.clamp01(item.impressivenessScore),
        roleRelevanceScore: this.clamp01(item.roleRelevanceScore),
        impressivenessNarrative: item.impressivenessNarrative || "",
      }))
      .sort((a, b) => {
        const bScore =
          b.deterministicScore + b.impressivenessScore * 100 + b.roleRelevanceScore * 100;
        const aScore =
          a.deterministicScore + a.impressivenessScore * 100 + a.roleRelevanceScore * 100;
        return bScore - aScore;
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  private monthsSince(dateValue?: string): number {
    if (!dateValue) {
      return Number.POSITIVE_INFINITY;
    }

    const timestamp = new Date(dateValue).getTime();
    if (Number.isNaN(timestamp)) {
      return Number.POSITIVE_INFINITY;
    }

    return (Date.now() - timestamp) / (1000 * 60 * 60 * 24 * 30);
  }

  private clamp01(value: number): number {
    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.min(Math.max(value, 0), 1);
  }
}

export const shippedWorkRanker = new ShippedWorkRankerAgent();
