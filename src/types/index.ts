export type ClaimType = 'skill' | 'project' | 'scale' | 'ownership' | 'deployment' | 'leadership' | 'outcome' | 'timeline' | 'employment'

export type ClaimVerdict = 'SUPPORTED' | 'WEAKLY_SUPPORTED' | 'UNVERIFIED' | 'CONTRADICTED'

export type AgentType = 'github_api' | 'github_browser' | 'portfolio_browser' | 'linkedin'

export interface JobRubric {
  title: string
  seniority: 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
  mustHaveSkills: string[]
  niceToHaveSkills: string[]
  focusAreas: string[]
  domainExpertise: string[]
  weights: {
    technical_depth: number
    shipped_work: number
    leadership: number
    scale_experience: number
  }
}

export interface ExtractedClaim {
  id: string
  type: ClaimType
  text: string
  keywords: string[]
  category: string
  jobRelevance: number
  priority: number
  verificationStrategy: AgentType[]
}

export interface RetrievalBudget {
  maxSteps: number
  maxTimeSeconds: number
  maxVisionCalls: number
  minEvidenceThreshold: number
}

export interface EvidenceSnippet {
  text: string
  relevance: number
  supportsClaim: boolean | 'uncertain'
  context?: string
}

export interface Evidence {
  claimId: string
  sourceUrl: string
  sourceType: string
  pageTitle?: string
  snippets: EvidenceSnippet[]
  screenshotS3Key?: string
  timestamp: Date
  agentReasoning: string
}

export interface ProvenanceLog {
  step: number
  action: string
  url: string
  timestamp: Date
  reasoning: string
  screenshotS3Key?: string
}

export interface ShippedWorkItem {
  title: string
  description: string
  technologies: string[]
  sourceUrl: string
  demoUrl?: string
  githubUrl?: string
  hasLiveDemo: boolean
  relevanceToRole: number
  technicalDepth: number
  recency?: string
  evidenceScreenshots: string[]
}

export interface EvidencePacket {
  id?: string
  candidateId: string
  claimId: string
  claimText: string
  claimType: ClaimType
  agentType: AgentType
  retrievalMode: 'api' | 'browser' | 'hybrid' | 'minimal'
  verdict: ClaimVerdict
  confidence: number
  evidence: Evidence[]
  provenance: ProvenanceLog[]
  shippedWork?: ShippedWorkItem[]
  visitedUrls: string[]
  totalSteps: number
  visionCallCount: number
  costUSD: number
  createdAt?: Date
}

export interface CandidateBrief {
  candidateId: string
  candidateName: string
  roleTitle: string
  fitScore: number
  evidenceScore: number
  shippedWorkScore: number
  confidenceScore: number
  verifiedClaims: VerifiedClaim[]
  weakClaims: WeakClaim[]
  risks: RiskFlag[]
  shippedWork: ShippedWorkItem[]
  interviewQuestions: InterviewQuestion[]
  evidencePackets: EvidencePacket[]
  createdAt: Date
}

export interface VerifiedClaim {
  claimText: string
  verdict: ClaimVerdict
  confidence: number
  sourceUrls: string[]
  summary: string
}

export interface WeakClaim {
  claimText: string
  reason: string
  followUpSuggestion: string
}

export interface RiskFlag {
  type: 'jd_mirroring' | 'unsupported_claim' | 'timeline_mismatch' | 'inflated_scale' | 'thin_evidence'
  severity: 'high' | 'medium' | 'low'
  description: string
  relatedClaim?: string
}

export interface InterviewQuestion {
  question: string
  relatedClaim: string
  purpose: string
  followUpProbes: string[]
}

export interface RankedShippedWork extends ShippedWorkItem {
  rank: number
  impressivenessNarrative: string
}

export interface JgmentResult {
  verdict: ClaimVerdict
  confidence: number
  reasoning: string
}

export interface AgentContext {
  claim: ExtractedClaim
  currentUrl: string
  visitedUrls: string[]
  evidenceCollected: Evidence[]
  stepsTaken: number
  timeElapsed: number
  lastScreenshot?: Buffer
  pageText: string
  budget: RetrievalBudget
}

export interface AgentAction {
  type: 'navigate' | 'click' | 'scroll' | 'extract' | 'done'
  target?: string
  reasoning: string
  expectedOutcome?: string
  extractedEvidence?: EvidenceSnippet[]
  doneReason?: string
}
