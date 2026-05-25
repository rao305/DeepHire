import { openrouter, AI_MODELS, parseAIJson, retryWithBackoff } from '@/lib/ai';
import {
  ExtractedClaim,
  JobRubric,
  ClaimType,
  AgentType,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI polishing detection result
 */
export interface AIPolishingResult {
  score: number; // 0-1, how AI-polished the resume seems to mirror the JD
  signals: string[]; // e.g., "Exact JD phrase appears verbatim in resume"
  verdict: 'low' | 'medium' | 'high';
}

/**
 * Raw claim extracted from resume before processing
 */
interface RawClaim {
  type: ClaimType;
  text: string;
  keywords: string[];
  category: string;
}

/**
 * Claim Extractor Agent
 * Extracts every verifiable claim from a resume and scores them against job rubric
 */
export class ClaimExtractorAgent {
  /**
   * Extract all verifiable claims from resume text
   * @param resumeText - Raw resume text
   * @param jobRubric - Job requirements rubric
   * @returns Array of extracted claims with verification strategies and priorities
   */
  async extractClaims(
    resumeText: string,
    jobRubric: JobRubric
  ): Promise<ExtractedClaim[]> {
    // CALL 1: Raw extraction
    const rawClaims = await this.extractRawClaims(resumeText);

    // CALL 2: Relevance scoring
    const scoredClaims = await this.scoreClaimRelevance(rawClaims, jobRubric);

    // Post-processing: assign IDs, strategies, priorities
    const processedClaims = scoredClaims.map((claim) => {
      const extractedClaim: ExtractedClaim = {
        id: uuidv4(),
        type: claim.type,
        text: claim.text,
        keywords: claim.keywords,
        category: claim.category,
        jobRelevance: claim.jobRelevance,
        priority: this.calculatePriority(claim, jobRubric),
        verificationStrategy: this.assignVerificationStrategy(claim),
      };
      return extractedClaim;
    });

    // Sort by priority and return top 10
    const topClaims = processedClaims
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);

    return topClaims;
  }

  /**
   * Detect if resume has been AI-polished to mirror the job description
   * @param resumeText - Raw resume text
   * @param jdText - Job description text
   * @returns AI polishing detection result
   */
  async detectAIPolishing(
    resumeText: string,
    jdText: string
  ): Promise<AIPolishingResult> {
    const systemPrompt = `You are an expert at detecting AI-generated or AI-polished resumes.

Analyze whether the resume has been artificially tailored to match the job description.

Look for:
- Exact phrases from JD appearing verbatim in resume
- Suspiciously perfect keyword alignment
- Unnatural use of JD-specific terminology
- Metrics that match JD requirements too precisely
- Generic AI writing patterns

Return JSON:
{
  "score": 0.0-1.0,
  "signals": ["array of specific red flags found"],
  "verdict": "low|medium|high"
}

Scoring:
- 0.0-0.3: low - natural resume
- 0.31-0.65: medium - some tailoring detected
- 0.66-1.0: high - likely AI-polished`;

    const userPrompt = `Job Description:
${jdText}

---

Resume:
${resumeText}

---

Analyze for AI polishing. Return valid JSON.`;

    const response = await retryWithBackoff(async () => {
      const completion = await openrouter.chat.completions.create({
        model: AI_MODELS.CHEAPEST,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || '';
    });

    const result = parseAIJson<AIPolishingResult>(response);

    // Validate and provide defaults
    return {
      score: Math.max(0, Math.min(1, result.score || 0)),
      signals: result.signals || [],
      verdict: result.verdict || this.getVerdictFromScore(result.score || 0),
    };
  }

  /**
   * Extract raw claims from resume (CALL 1)
   */
  private async extractRawClaims(resumeText: string): Promise<RawClaim[]> {
    const systemPrompt = `You are an expert technical recruiter extracting verifiable claims from resumes.

Extract EVERY claim that can be verified against public evidence (GitHub, portfolio, LinkedIn).

Focus on:
- Specific technologies used (e.g., "Built API with Node.js and PostgreSQL")
- Projects built (e.g., "Created e-commerce platform with 10K users")
- Scale metrics (e.g., "Optimized queries handling 1M requests/day")
- Ownership statements (e.g., "Led development of authentication system")
- Deployment claims (e.g., "Deployed to AWS using Docker and Kubernetes")
- Leadership claims (e.g., "Mentored 3 junior engineers")
- Business outcomes (e.g., "Reduced load time by 60%")
- Timeline/employment (e.g., "Software Engineer at Company X, 2020-2023")

Do NOT extract:
- Soft skills ("team player", "good communicator")
- Generic statements ("responsible for development")
- Personal attributes ("passionate", "dedicated")

Return JSON:
{
  "claims": [
    {
      "type": "skill|project|scale|ownership|deployment|leadership|outcome|timeline|employment",
      "text": "exact claim text",
      "keywords": ["key", "words"],
      "category": "brief category like 'backend', 'frontend', 'infrastructure'"
    }
  ]
}`;

    const userPrompt = `Extract all verifiable claims from this resume:

${resumeText}

Return valid JSON with array of claims.`;

    const response = await retryWithBackoff(async () => {
      const completion = await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || '';
    });

    const result = parseAIJson<{ claims: RawClaim[] }>(response);
    return result.claims || [];
  }

  /**
   * Score each claim's relevance to the job rubric (CALL 2)
   */
  private async scoreClaimRelevance(
    rawClaims: RawClaim[],
    jobRubric: JobRubric
  ): Promise<Array<RawClaim & { jobRelevance: number }>> {
    const systemPrompt = `You are an expert at scoring resume claims against job requirements.

Score each claim from 0.0 to 1.0 based on relevance to the job rubric:

- 0.8-1.0: Must-have skill or directly relevant experience
- 0.5-0.79: Nice-to-have skill or related experience
- 0.1-0.49: Tangentially related or general experience
- 0.0-0.09: Unrelated

Consider:
- Does the claim involve must-have skills?
- Does it align with focus areas?
- Is it relevant to the seniority level?
- Does it demonstrate required expertise?

Return JSON:
{
  "scores": [
    {
      "index": 0,
      "score": 0.0-1.0,
      "reasoning": "brief explanation"
    }
  ]
}`;

    const userPrompt = `Job Rubric:
Title: ${jobRubric.title}
Seniority: ${jobRubric.seniority}
Must-have skills: ${jobRubric.mustHaveSkills.join(', ')}
Nice-to-have skills: ${jobRubric.niceToHaveSkills.join(', ')}
Focus areas: ${jobRubric.focusAreas.join(', ')}
Domain expertise: ${jobRubric.domainExpertise.join(', ')}

---

Claims to score:
${rawClaims.map((c, i) => `${i}. [${c.type}] ${c.text}`).join('\n')}

---

Score each claim's relevance. Return valid JSON.`;

    const response = await retryWithBackoff(async () => {
      const completion = await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || '';
    });

    const result = parseAIJson<{
      scores: Array<{ index: number; score: number; reasoning?: string }>;
    }>(response);

    // Merge scores with claims
    return rawClaims.map((claim, i) => {
      const scoreEntry = result.scores?.find((s) => s.index === i);
      return {
        ...claim,
        jobRelevance: scoreEntry?.score || 0.5, // Default to medium if not found
      };
    });
  }

  /**
   * Assign verification strategy based on claim type
   */
  private assignVerificationStrategy(
    claim: RawClaim & { jobRelevance: number }
  ): AgentType[] {
    const strategyMap: Record<ClaimType, AgentType[]> = {
      skill: ['github_api', 'github_browser'],
      project: ['github_browser', 'portfolio_browser'],
      scale: ['portfolio_browser', 'github_browser'],
      ownership: ['github_browser'],
      deployment: ['portfolio_browser', 'github_browser'],
      leadership: ['linkedin'],
      outcome: ['portfolio_browser'],
      timeline: ['linkedin'],
      employment: ['linkedin'],
    };

    return strategyMap[claim.type] || ['github_browser'];
  }

  /**
   * Calculate priority score for a claim
   * Formula: (jobRelevance * 0.6) + (verifiability * 0.25) + (type_weight * 0.15)
   */
  private calculatePriority(
    claim: RawClaim & { jobRelevance: number },
    rubric: JobRubric
  ): number {
    // Type weights based on verification value
    const typeWeights: Record<ClaimType, number> = {
      scale: 1.0,
      deployment: 0.9,
      ownership: 0.9,
      project: 0.8,
      skill: 0.7,
      outcome: 0.7,
      leadership: 0.6,
      timeline: 0.5,
      employment: 0.5,
    };

    const typeWeight = typeWeights[claim.type] || 0.5;

    // Verifiability: claims with more specific keywords are easier to verify
    const verifiability = Math.min(
      1.0,
      0.5 + claim.keywords.length * 0.1
    );

    // Calculate priority
    const priority =
      claim.jobRelevance * 0.6 +
      verifiability * 0.25 +
      typeWeight * 0.15;

    return Math.max(0, Math.min(1, priority));
  }

  /**
   * Get verdict from score
   */
  private getVerdictFromScore(score: number): 'low' | 'medium' | 'high' {
    if (score <= 0.3) return 'low';
    if (score <= 0.65) return 'medium';
    return 'high';
  }
}

/**
 * Singleton instance of ClaimExtractorAgent
 */
export const claimExtractorAgent = new ClaimExtractorAgent();
