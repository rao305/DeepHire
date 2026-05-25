import { openrouter, AI_MODELS, parseAIJson, retryWithBackoff } from '@/lib/ai'
import type {
  ExtractedClaim,
  Evidence,
  EvidencePacket,
  ClaimVerdict,
  RiskFlag,
  JobRubric,
  ShippedWorkItem,
} from '@/types'

export interface JudgmentResult {
  verdict: ClaimVerdict
  confidence: number
  reasoning: string
  keyEvidence: string[]
  contradictions: string[]
}

export interface CandidateScores {
  fitScore: number
  evidenceScore: number
  shippedWorkScore: number
  confidenceScore: number
  breakdown: {
    totalClaims: number
    supported: number
    weaklySupported: number
    unverified: number
    contradicted: number
  }
}

export class EvidenceJudgeAgent {
  async judgeEvidence(
    claim: ExtractedClaim,
    evidence: Evidence[],
    candidateName: string
  ): Promise<JudgmentResult> {
    return retryWithBackoff(async () => {
      const prompt = this.buildJudgmentPrompt(claim, evidence, candidateName)

      const response = await openrouter.chat.completions.create({
        model: AI_MODELS.QUALITY, // Claude Haiku for better reasoning
        max_tokens: 800,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty judgment response')
      }

      const rawResult = parseAIJson<{
        verdict: string
        confidence: number
        reasoning: string
        keyEvidence: string[]
        contradictions: string[]
      }>(content)

      // Normalize verdict to match ClaimVerdict type
      const verdict = this.normalizeVerdict(rawResult.verdict)

      return {
        verdict,
        confidence: Math.max(0, Math.min(1, rawResult.confidence)),
        reasoning: rawResult.reasoning,
        keyEvidence: rawResult.keyEvidence || [],
        contradictions: rawResult.contradictions || [],
      }
    })
  }

  async judgeAllClaims(
    claims: ExtractedClaim[],
    allEvidencePackets: EvidencePacket[],
    candidateName: string
  ): Promise<Map<string, JudgmentResult>> {
    const judgmentPromises = claims.map(async (claim) => {
      const claimEvidence = allEvidencePackets
        .filter((packet) => packet.claimId === claim.id)
        .flatMap((packet) => packet.evidence)

      const judgment = await this.judgeEvidence(claim, claimEvidence, candidateName)
      return [claim.id, judgment] as const
    })

    const judgments = await Promise.all(judgmentPromises)
    return new Map(judgments)
  }

  async detectRiskFlags(
    claims: ExtractedClaim[],
    judgments: Map<string, JudgmentResult>,
    aiPolishingScore: number
  ): Promise<RiskFlag[]> {
    const risks: RiskFlag[] = []

    const importantClaims = claims.filter((c) => c.jobRelevance > 0.7)
    const unverifiedCount = Array.from(judgments.values()).filter(
      (j) => j.verdict === 'UNVERIFIED'
    ).length
    const contradictedClaims = Array.from(judgments.entries()).filter(
      ([_, j]) => j.verdict === 'CONTRADICTED'
    )
    const supportedCount = Array.from(judgments.values()).filter(
      (j) => j.verdict === 'SUPPORTED'
    ).length

    // JD Mirroring: AI-polished resume with many unverified claims
    if (aiPolishingScore > 0.7 && unverifiedCount > claims.length * 0.5) {
      risks.push({
        type: 'jd_mirroring',
        severity: 'high',
        description: `Resume shows signs of AI polishing (${(aiPolishingScore * 100).toFixed(0)}%) with ${unverifiedCount}/${claims.length} claims unverified. May be mirroring job description language.`,
      })
    }

    // Unsupported high-relevance claims
    for (const claim of importantClaims) {
      const judgment = judgments.get(claim.id)
      if (judgment && judgment.verdict === 'UNVERIFIED') {
        risks.push({
          type: 'unsupported_claim',
          severity: claim.jobRelevance > 0.9 ? 'high' : 'medium',
          description: `High-relevance claim lacks verification: "${claim.text.slice(0, 80)}..."`,
          relatedClaim: claim.text,
        })
      }
    }

    // Contradicted claims
    for (const [claimId, judgment] of contradictedClaims) {
      const claim = claims.find((c) => c.id === claimId)
      if (claim) {
        risks.push({
          type: 'unsupported_claim',
          severity: 'high',
          description: `Evidence contradicts claim: "${claim.text.slice(0, 80)}...". ${judgment.contradictions.join('; ')}`,
          relatedClaim: claim.text,
        })
      }
    }

    // Inflated scale claims
    const scaleClaims = claims.filter((c) => c.type === 'scale')
    for (const claim of scaleClaims) {
      const judgment = judgments.get(claim.id)
      if (judgment && judgment.verdict !== 'SUPPORTED' && judgment.confidence < 0.5) {
        risks.push({
          type: 'inflated_scale',
          severity: 'medium',
          description: `Scale claim cannot be verified: "${claim.text.slice(0, 80)}..."`,
          relatedClaim: claim.text,
        })
      }
    }

    // Overall thin evidence
    const avgConfidence =
      Array.from(judgments.values()).reduce((sum, j) => sum + j.confidence, 0) /
      judgments.size

    if (avgConfidence < 0.4 && supportedCount < claims.length * 0.3) {
      risks.push({
        type: 'thin_evidence',
        severity: 'medium',
        description: `Overall evidence quality is low. Average confidence: ${(avgConfidence * 100).toFixed(0)}%, only ${supportedCount}/${claims.length} claims fully supported.`,
      })
    }

    return risks
  }

  calculateScores(
    claims: ExtractedClaim[],
    judgments: Map<string, JudgmentResult>,
    rubric: JobRubric,
    shippedWork: ShippedWorkItem[] = []
  ): CandidateScores {
    // Fit score: weighted average of top 5 most relevant claims
    const topClaims = [...claims]
      .sort((a, b) => b.jobRelevance - a.jobRelevance)
      .slice(0, 5)
    const fitScore =
      topClaims.reduce((sum, claim) => sum + claim.jobRelevance, 0) / topClaims.length

    // Evidence score: weighted by verdict
    const importantClaims = claims.filter((c) => c.jobRelevance > 0.5)
    let evidencePoints = 0
    let supported = 0
    let weaklySupported = 0
    let unverified = 0
    let contradicted = 0

    for (const claim of importantClaims) {
      const judgment = judgments.get(claim.id)
      if (!judgment) continue

      switch (judgment.verdict) {
        case 'SUPPORTED':
          evidencePoints += 1.0
          supported++
          break
        case 'WEAKLY_SUPPORTED':
          evidencePoints += 0.5
          weaklySupported++
          break
        case 'UNVERIFIED':
          unverified++
          break
        case 'CONTRADICTED':
          evidencePoints -= 0.3
          contradicted++
          break
      }
    }

    const evidenceScore = Math.max(
      0,
      Math.min(1, evidencePoints / importantClaims.length)
    )

    // Shipped work score
    const shippedWorkScore =
      shippedWork.length > 0
        ? shippedWork.reduce((sum, work) => sum + work.relevanceToRole, 0) /
          shippedWork.length
        : 0

    // Confidence score: average confidence across all judgments
    const confidences = Array.from(judgments.values()).map((j) => j.confidence)
    const confidenceScore =
      confidences.length > 0
        ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
        : 0

    return {
      fitScore,
      evidenceScore,
      shippedWorkScore,
      confidenceScore,
      breakdown: {
        totalClaims: claims.length,
        supported,
        weaklySupported,
        unverified,
        contradicted,
      },
    }
  }

  private buildJudgmentPrompt(
    claim: ExtractedClaim,
    evidence: Evidence[],
    candidateName: string
  ): string {
    if (evidence.length === 0) {
      return `Evaluate this claim from ${candidateName}'s resume:

CLAIM: "${claim.text}"
Type: ${claim.type}
Keywords: ${claim.keywords.join(', ')}

EVIDENCE: None found.

Return JSON:
{
  "verdict": "UNVERIFIED",
  "confidence": 0.0,
  "reasoning": "No evidence was found to verify this claim.",
  "keyEvidence": [],
  "contradictions": []
}`
    }

    const evidenceText = evidence
      .map((e, i) => {
        const snippetsText = e.snippets
          .map(
            (s) =>
              `  - "${s.text}" (relevance: ${s.relevance.toFixed(2)}, supports: ${s.supportsClaim})`
          )
          .join('\n')

        return `${i + 1}. Source: ${e.sourceUrl}
   ${e.pageTitle ? `Page: ${e.pageTitle}` : ''}
   Agent: ${e.agentReasoning}

   Snippets:
${snippetsText}`
      })
      .join('\n\n')

    return `You are an expert technical recruiter evaluating evidence quality.

Evaluate this claim from ${candidateName}'s resume:

CLAIM: "${claim.text}"
Type: ${claim.type}
Keywords: ${claim.keywords.join(', ')}
Job Relevance: ${claim.jobRelevance.toFixed(2)}

EVIDENCE COLLECTED:
${evidenceText}

Determine the verdict. Return JSON:
{
  "verdict": "SUPPORTED" | "WEAKLY_SUPPORTED" | "UNVERIFIED" | "CONTRADICTED",
  "confidence": 0.0-1.0,
  "reasoning": "Explain your judgment in 2-3 sentences",
  "keyEvidence": ["exact quote 1", "exact quote 2"],
  "contradictions": ["contradiction 1"] or []
}

Verdict definitions:
- SUPPORTED: Multiple clear pieces of direct evidence from credible sources
- WEAKLY_SUPPORTED: Some indirect evidence, or single source, not fully conclusive
- UNVERIFIED: No relevant evidence found, or evidence is too vague
- CONTRADICTED: Evidence directly contradicts the claim

Be objective and evidence-focused. Prefer WEAKLY_SUPPORTED over UNVERIFIED if there's any supporting signal.`
  }

  private normalizeVerdict(verdict: string): ClaimVerdict {
    const normalized = verdict.toUpperCase()
    const validVerdicts: ClaimVerdict[] = [
      'SUPPORTED',
      'WEAKLY_SUPPORTED',
      'UNVERIFIED',
      'CONTRADICTED',
    ]

    if (validVerdicts.includes(normalized as ClaimVerdict)) {
      return normalized as ClaimVerdict
    }

    // Fallback mapping
    if (normalized.includes('SUPPORT')) return 'SUPPORTED'
    if (normalized.includes('WEAK')) return 'WEAKLY_SUPPORTED'
    if (normalized.includes('CONTRADICT') || normalized.includes('FALSE'))
      return 'CONTRADICTED'

    return 'UNVERIFIED'
  }
}

export const evidenceJudgeAgent = new EvidenceJudgeAgent()
