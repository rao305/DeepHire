import { openrouter, MODELS, parseAIJson, retryWithBackoff } from "@/lib/ai"
import type {
  JudgmentResult,
  CandidateScores,
} from "@/agents/evidence/evidence-judge.agent"
import type { RankedShippedWork } from "@/agents/evidence/shipped-work-ranker.agent"
import type {
  CandidateBrief,
  JobRubric,
  ExtractedClaim,
  RiskFlag,
  EvidencePacket,
  VerifiedClaim,
  WeakClaim,
  InterviewQuestion,
} from "@/types"

interface BriefGenerationInput {
  candidate: { id: string; name: string; email?: string }
  job: { title: string; description: string }
  jobRubric: JobRubric
  claims: ExtractedClaim[]
  judgments: Map<string, JudgmentResult>
  scores: CandidateScores
  risks: RiskFlag[]
  shippedWork: RankedShippedWork[]
  evidencePackets: EvidencePacket[]
  interviewQuestions?: InterviewQuestion[]
}

export class BriefGeneratorAgent {
  /**
   * Generate complete candidate brief from verification results.
   *
   * The returned object matches the `CandidateBrief` type in `@/types` so it
   * can be persisted directly into the `candidate_briefs` table.
   */
  async generateBrief(input: BriefGenerationInput): Promise<CandidateBrief> {
    const {
      candidate,
      job,
      claims,
      judgments,
      scores,
      risks,
      shippedWork,
      evidencePackets,
      interviewQuestions = [],
    } = input

    const verifiedClaimsRaw = claims.filter((claim) => {
      const j = judgments.get(claim.id)
      return j && (j.verdict === "SUPPORTED" || j.verdict === "WEAKLY_SUPPORTED")
    })

    const weakClaimsRaw = claims.filter((claim) => {
      const j = judgments.get(claim.id)
      return j && (j.verdict === "UNVERIFIED" || j.verdict === "CONTRADICTED")
    })

    const verifiedClaimSummaries = await this.generateVerifiedClaimsSummary(
      verifiedClaimsRaw,
      judgments,
      evidencePackets
    )

    const weakClaimSummaries = await Promise.all(
      weakClaimsRaw.map((claim) => {
        const j = judgments.get(claim.id)
        if (!j) {
          return Promise.resolve<WeakClaim>({
            claimText: claim.text,
            reason: "No judgment available",
            followUpSuggestion: "Manual verification needed",
          })
        }
        return this.generateWeakClaimSummary(claim, j)
      })
    )

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      roleTitle: job.title,
      fitScore: scores.fitScore,
      evidenceScore: scores.evidenceScore,
      shippedWorkScore: scores.shippedWorkScore,
      confidenceScore: scores.confidenceScore,
      verifiedClaims: verifiedClaimSummaries,
      weakClaims: weakClaimSummaries,
      risks,
      shippedWork,
      interviewQuestions,
      evidencePackets,
      createdAt: new Date(),
    }
  }

  /**
   * Generate recruiter-friendly summaries for verified claims.
   * Uses Claude Haiku for natural prose.
   */
  async generateVerifiedClaimsSummary(
    claims: ExtractedClaim[],
    judgments: Map<string, JudgmentResult>,
    evidencePackets: EvidencePacket[]
  ): Promise<VerifiedClaim[]> {
    if (claims.length === 0) {
      return []
    }

    const claimsWithEvidence = claims.map((claim) => {
      const judgment = judgments.get(claim.id)
      const packets = evidencePackets.filter((p) => p.claimId === claim.id)
      const sourceUrls = Array.from(
        new Set(
          packets.flatMap((p) =>
            (p.evidence ?? []).map((e) => e.sourceUrl).filter(Boolean)
          )
        )
      )
      return {
        claimId: claim.id,
        claimText: claim.text,
        verdict: judgment?.verdict ?? "UNVERIFIED",
        confidence: judgment?.confidence ?? 0,
        evidenceCount: packets.length,
        sourceUrls,
      }
    })

    const prompt = `You are a technical recruiter writing candidate summaries.

For each verified claim below, write ONE SENTENCE summary in plain English, friendly tone.

Examples:
- "Found 3 GitHub repos with extensive React code including a live e-commerce app with 1200+ commits"
- "LinkedIn profile shows 4 years at Google as Senior Software Engineer"
- "Confirmed AWS Solutions Architect certification valid through 2025"

Claims to summarize:
${claimsWithEvidence
  .map(
    (c) =>
      `- ID: ${c.claimId}\n  Claim: ${c.claimText}\n  Verdict: ${c.verdict}\n  Confidence: ${c.confidence}\n  Evidence sources found: ${c.evidenceCount}`
  )
  .join("\n\n")}

Return JSON in this exact shape:
{
  "summaries": [
    { "claimId": "...", "summary": "...one sentence..." }
  ]
}`

    return retryWithBackoff(async () => {
      const response = await openrouter.chat.completions.create({
        model: MODELS.QUALITY, // anthropic/claude-3-haiku
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      })

      const content = response.choices[0]?.message?.content ?? "{}"
      const parsed = parseAIJson<{
        summaries: Array<{ claimId: string; summary: string }>
      }>(content)

      const summaryMap = new Map(
        (parsed.summaries ?? []).map((s) => [s.claimId, s.summary])
      )

      return claimsWithEvidence.map<VerifiedClaim>((c) => ({
        claimText: c.claimText,
        verdict: c.verdict,
        confidence: c.confidence,
        sourceUrls: c.sourceUrls,
        summary:
          summaryMap.get(c.claimId) ??
          `${c.claimText} — supporting evidence found.`,
      }))
    })
  }

  /**
   * Generate explanation for weak/unverified claims.
   */
  async generateWeakClaimSummary(
    claim: ExtractedClaim,
    judgment: JudgmentResult
  ): Promise<WeakClaim> {
    const prompt = `You are a technical recruiter explaining why a claim couldn't be verified.

Claim: "${claim.text}"
Verdict: ${judgment.verdict}
Reasoning: ${judgment.reasoning}

Write:
1. A plain English reason (one sentence) explaining why this wasn't verified
2. A specific follow-up suggestion for the recruiter

Return JSON:
{
  "reason": "Could not find public GitHub profile matching this candidate",
  "followUpSuggestion": "Ask candidate for GitHub username or portfolio link"
}`

    return retryWithBackoff(async () => {
      const response = await openrouter.chat.completions.create({
        model: MODELS.QUALITY,
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      })

      const content = response.choices[0]?.message?.content ?? "{}"
      const parsed = parseAIJson<{
        reason: string
        followUpSuggestion: string
      }>(content)

      return {
        claimText: claim.text,
        reason: parsed.reason || judgment.reasoning,
        followUpSuggestion:
          parsed.followUpSuggestion ||
          "Ask the candidate for additional evidence.",
      }
    })
  }

  /**
   * Generate 3-5 sentence ATS summary for copy-paste. Returns plain text.
   */
  async generateATSSummary(brief: CandidateBrief): Promise<string> {
    const overall = (
      (brief.fitScore + brief.evidenceScore + brief.shippedWorkScore) /
      3
    ).toFixed(2)

    const prompt = `You are a technical recruiter writing an ATS note.

Write a 3-5 sentence summary for this candidate applying to "${brief.roleTitle}".

Format: "DeepHire analysis for ${brief.candidateName} applying to ${brief.roleTitle}: ..."

Include:
- Overall match score (${overall} on 0-1 scale)
- Key verified strengths (2-3 highlights from verified claims)
- Any notable risks or gaps

Keep it professional, concise, recruiter-friendly.

Verified claims:
${brief.verifiedClaims.map((c) => `- ${c.summary}`).join("\n")}

Risks:
${
  brief.risks.length > 0
    ? brief.risks
        .map((r) => `- ${r.severity}: ${r.description}`)
        .join("\n")
    : "None"
}

Write the ATS note as plain text (not JSON).`

    return retryWithBackoff(async () => {
      const response = await openrouter.chat.completions.create({
        model: MODELS.QUALITY,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      })

      const content = response.choices[0]?.message?.content?.trim()
      if (!content) {
        throw new Error("Empty ATS summary response")
      }
      return content
    })
  }

  /**
   * Generate a punchy one-line title for the brief.
   */
  async generateBriefTitle(
    candidate: { name: string },
    scores: CandidateScores
  ): Promise<string> {
    const prompt = `You are a technical recruiter writing a brief title.

Candidate: ${candidate.name}
Fit score: ${scores.fitScore.toFixed(2)}
Evidence score: ${scores.evidenceScore.toFixed(2)}
Shipped work score: ${scores.shippedWorkScore.toFixed(2)}
Confidence score: ${scores.confidenceScore.toFixed(2)}

Write ONE punchy line (under 80 chars) that captures the candidate at a glance.

Examples:
- "Strong full-stack builder, React expertise confirmed, scale claims unverified"
- "Senior backend engineer, proven AWS skills, startup experience verified"
- "Mid-level frontend dev, solid fundamentals, limited shipped work found"

Return JSON:
{
  "title": "your title here"
}`

    return retryWithBackoff(async () => {
      const response = await openrouter.chat.completions.create({
        model: MODELS.QUALITY,
        max_tokens: 150,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      })

      const content = response.choices[0]?.message?.content ?? "{}"
      const parsed = parseAIJson<{ title: string }>(content)
      return parsed.title || `${candidate.name}: candidate brief`
    })
  }
}

export const briefGeneratorAgent = new BriefGeneratorAgent()
