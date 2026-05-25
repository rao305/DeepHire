import type {
  ExtractedClaim,
  JobRubric,
  AgentType,
  RetrievalBudget,
  ClaimType,
} from '@/types'

export interface VerificationTask {
  claim: ExtractedClaim
  agents: AgentType[]
  budget: RetrievalBudget
  estimatedCost: number
  reasoning: string
}

export interface SkippedClaim {
  claim: ExtractedClaim
  reason: string
  score: number
}

export interface PrioritizedVerificationPlan {
  highPriority: VerificationTask[]
  mediumPriority: VerificationTask[]
  skip: SkippedClaim[]
  estimatedTotalCost: number
  estimatedTimeMinutes: number
}

interface AvailableLinks {
  github?: string
  portfolio?: string
  linkedin?: string
}

type PriorityLevel = 'high' | 'medium' | 'skip'

const CLAIM_TYPE_WEIGHTS: Record<ClaimType, number> = {
  project: 1.0,
  deployment: 0.95,
  scale: 0.9,
  ownership: 0.85,
  skill: 0.8,
  outcome: 0.75,
  leadership: 0.7,
  timeline: 0.5,
  employment: 0.4,
}

const AGENT_COSTS_USD = {
  github_api: 0.0,
  github_browser: 0.01,
  portfolio_browser: 0.0125,
  linkedin: 0.0067,
} as const

const PRIORITY_THRESHOLDS = {
  high: 0.7,
  medium: 0.4,
} as const

export class ClaimPrioritizerAgent {
  prioritizeClaims(
    claims: ExtractedClaim[],
    rubric: JobRubric,
    availableLinks: AvailableLinks,
    maxClaims: number = 5
  ): PrioritizedVerificationPlan {
    const scoredClaims = claims
      .map((claim) => ({
        claim,
        score: this.calculateClaimScore(claim, rubric, availableLinks),
        verifiability: this.determineClaimVerifiability(claim, availableLinks),
      }))
      .filter((item) => item.verifiability > 0)
      .sort((a, b) => b.score - a.score)

    const highPriority: VerificationTask[] = []
    const mediumPriority: VerificationTask[] = []
    const skip: SkippedClaim[] = []

    for (const { claim, score, verifiability } of scoredClaims) {
      const priority = this.determinePriority(score)

      if (priority === 'skip' || verifiability < 0.3) {
        skip.push({
          claim,
          reason: verifiability < 0.3
            ? 'Insufficient verifiable sources available'
            : `Low relevance score (${score.toFixed(2)}) for role requirements`,
          score,
        })
        continue
      }

      if (highPriority.length + mediumPriority.length >= maxClaims) {
        skip.push({
          claim,
          reason: `Budget limit reached (max ${maxClaims} claims)`,
          score,
        })
        continue
      }

      const task = this.createVerificationTask(claim, priority, availableLinks, rubric)

      if (priority === 'high') {
        highPriority.push(task)
      } else {
        mediumPriority.push(task)
      }
    }

    const allTasks = [...highPriority, ...mediumPriority]
    const estimatedTotalCost = this.estimateVerificationCost(allTasks)
    const estimatedTimeMinutes = this.estimateTotalTime(allTasks)

    return {
      highPriority,
      mediumPriority,
      skip,
      estimatedTotalCost,
      estimatedTimeMinutes,
    }
  }

  determineClaimVerifiability(
    claim: ExtractedClaim,
    availableLinks: AvailableLinks
  ): number {
    const strategies = claim.verificationStrategy
    let verifiabilityScore = 0
    let maxPossible = 0

    for (const agent of strategies) {
      maxPossible += 1

      if (agent === 'github_api' || agent === 'github_browser') {
        if (availableLinks.github) verifiabilityScore += 1
      } else if (agent === 'portfolio_browser') {
        if (availableLinks.portfolio) verifiabilityScore += 1
      } else if (agent === 'linkedin') {
        if (availableLinks.linkedin) verifiabilityScore += 1
      }
    }

    return maxPossible > 0 ? verifiabilityScore / maxPossible : 0
  }

  calculateBudget(priority: PriorityLevel): RetrievalBudget {
    switch (priority) {
      case 'high':
        return {
          maxSteps: 15,
          maxVisionCalls: 5,
          maxTimeSeconds: 120,
          minEvidenceThreshold: 0.7,
        }
      case 'medium':
        return {
          maxSteps: 10,
          maxVisionCalls: 3,
          maxTimeSeconds: 90,
          minEvidenceThreshold: 0.6,
        }
      case 'skip':
      default:
        return {
          maxSteps: 0,
          maxVisionCalls: 0,
          maxTimeSeconds: 0,
          minEvidenceThreshold: 0,
        }
    }
  }

  estimateVerificationCost(tasks: VerificationTask[]): number {
    return tasks.reduce((total, task) => total + task.estimatedCost, 0)
  }

  private calculateClaimScore(
    claim: ExtractedClaim,
    rubric: JobRubric,
    availableLinks: AvailableLinks
  ): number {
    const relevance = claim.jobRelevance
    const verifiability = this.determineClaimVerifiability(claim, availableLinks)
    const typeWeight = CLAIM_TYPE_WEIGHTS[claim.type] || 0.5

    const keywordBoost = this.calculateKeywordBoost(claim, rubric)

    return relevance * verifiability * typeWeight * (1 + keywordBoost)
  }

  private calculateKeywordBoost(claim: ExtractedClaim, rubric: JobRubric): number {
    const allRubricTerms = [
      ...rubric.mustHaveSkills,
      ...rubric.niceToHaveSkills,
      ...rubric.focusAreas,
      ...rubric.domainExpertise,
    ].map((term) => term.toLowerCase())

    const claimKeywords = claim.keywords.map((kw) => kw.toLowerCase())

    const matchCount = claimKeywords.filter((kw) =>
      allRubricTerms.some((term) => term.includes(kw) || kw.includes(term))
    ).length

    return Math.min(matchCount * 0.15, 0.5)
  }

  private determinePriority(score: number): PriorityLevel {
    if (score >= PRIORITY_THRESHOLDS.high) return 'high'
    if (score >= PRIORITY_THRESHOLDS.medium) return 'medium'
    return 'skip'
  }

  private createVerificationTask(
    claim: ExtractedClaim,
    priority: PriorityLevel,
    availableLinks: AvailableLinks,
    rubric: JobRubric
  ): VerificationTask {
    const budget = this.calculateBudget(priority)
    const agents = this.selectAgents(claim, availableLinks)
    const estimatedCost = this.estimateTaskCost(agents, budget)
    const reasoning = this.generateTaskReasoning(claim, priority, agents, rubric)

    return {
      claim,
      agents,
      budget,
      estimatedCost,
      reasoning,
    }
  }

  private selectAgents(
    claim: ExtractedClaim,
    availableLinks: AvailableLinks
  ): AgentType[] {
    return claim.verificationStrategy.filter((agent) => {
      if (agent === 'github_api' || agent === 'github_browser') {
        return !!availableLinks.github
      }
      if (agent === 'portfolio_browser') {
        return !!availableLinks.portfolio
      }
      if (agent === 'linkedin') {
        return !!availableLinks.linkedin
      }
      return false
    })
  }

  private estimateTaskCost(agents: AgentType[], budget: RetrievalBudget): number {
    return agents.reduce((cost, agent) => {
      const baseCost = AGENT_COSTS_USD[agent]

      if (agent === 'github_browser' || agent === 'portfolio_browser') {
        return cost + baseCost * budget.maxVisionCalls
      }

      return cost + baseCost
    }, 0)
  }

  private generateTaskReasoning(
    claim: ExtractedClaim,
    priority: PriorityLevel,
    agents: AgentType[],
    rubric: JobRubric
  ): string {
    const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1)
    const agentList = agents.join(', ')
    const claimTypeLabel = claim.type.replace('_', ' ')

    const rubricAlignment = this.describeRubricAlignment(claim, rubric)

    return `${priorityLabel} priority ${claimTypeLabel} claim (relevance: ${claim.jobRelevance.toFixed(2)}). ${rubricAlignment} Verifying via: ${agentList}.`
  }

  private describeRubricAlignment(claim: ExtractedClaim, rubric: JobRubric): string {
    const mustHaveMatch = claim.keywords.some((kw) =>
      rubric.mustHaveSkills.some((skill) =>
        skill.toLowerCase().includes(kw.toLowerCase()) ||
        kw.toLowerCase().includes(skill.toLowerCase())
      )
    )

    if (mustHaveMatch) {
      return 'Directly aligns with must-have requirements.'
    }

    const focusMatch = claim.keywords.some((kw) =>
      rubric.focusAreas.some((area) =>
        area.toLowerCase().includes(kw.toLowerCase()) ||
        kw.toLowerCase().includes(area.toLowerCase())
      )
    )

    if (focusMatch) {
      return 'Aligns with key focus areas.'
    }

    return 'Relevant to role requirements.'
  }

  private estimateTotalTime(tasks: VerificationTask[]): number {
    const totalSeconds = tasks.reduce(
      (total, task) => total + task.budget.maxTimeSeconds,
      0
    )

    return Math.ceil(totalSeconds / 60)
  }
}

export const claimPrioritizerAgent = new ClaimPrioritizerAgent()
