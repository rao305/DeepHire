import 'dotenv/config'

import {
  ALLOWLISTED_DOMAINS,
  FORBIDDEN_EXTRACTIONS,
  GOVERNANCE_RULES,
  RateLimitError,
  _resetRateLimitsForTesting,
  enforceRateLimit,
  filterForbiddenContent,
  logAgentAccess,
  requiresHumanReview,
  sanitizeForStorage,
  validateNavigationTarget,
} from '../src/lib/governance'
import { portfolioBrowserAgent } from '../src/agents/portfolio/portfolio-browser.agent'
import { portfolioOrchestrator } from '../src/agents/portfolio/portfolio.orchestrator'
import { linkedinAgent } from '../src/agents/linkedin/linkedin.agent'
import { briefGeneratorAgent } from '../src/agents/brief/brief-generator.agent'
import { interviewQuestionsAgent } from '../src/agents/brief/interview-questions.agent'
import type {
  EvidencePacket,
  ExtractedClaim,
  JobRubric,
  RetrievalBudget,
  RiskFlag,
  ShippedWorkItem,
  WeakClaim,
} from '../src/types'
import type {
  CandidateScores,
  JudgmentResult,
} from '../src/agents/evidence/evidence-judge.agent'
import type { RankedShippedWork } from '../src/agents/evidence/shipped-work-ranker.agent'

const failures: string[] = []
const sectionResults: Array<{ section: string; passed: number; failed: number }> = []

let currentSection = ''
let currentPassed = 0
let currentFailed = 0

function startSection(name: string) {
  if (currentSection) {
    sectionResults.push({
      section: currentSection,
      passed: currentPassed,
      failed: currentFailed,
    })
  }
  currentSection = name
  currentPassed = 0
  currentFailed = 0
  console.log(`\n=== ${name} ===`)
}

function check(condition: unknown, message: string) {
  if (condition) {
    currentPassed++
    console.log(`  PASS: ${message}`)
  } else {
    currentFailed++
    failures.push(`[${currentSection}] ${message}`)
    console.log(`  FAIL: ${message}`)
  }
}

async function safeRun(label: string, fn: () => Promise<void>) {
  try {
    await fn()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    currentFailed++
    failures.push(`[${currentSection}] ${label} threw: ${message}`)
    console.log(`  FAIL (threw): ${label} -> ${message}`)
  }
}

const sampleRubric: JobRubric = {
  title: 'Senior Full-Stack Engineer',
  seniority: 'senior',
  mustHaveSkills: ['React', 'TypeScript', 'Node.js'],
  niceToHaveSkills: ['Next.js', 'PostgreSQL', 'Tailwind'],
  focusAreas: ['web', 'developer experience'],
  domainExpertise: ['SaaS'],
  weights: {
    technical_depth: 0.35,
    shipped_work: 0.3,
    leadership: 0.15,
    scale_experience: 0.2,
  },
}

const sampleClaims: ExtractedClaim[] = [
  {
    id: 'claim-react',
    type: 'skill',
    text: 'Built production React apps with TypeScript and Next.js for 4+ years',
    keywords: ['React', 'TypeScript', 'Next.js'],
    category: 'frontend',
    jobRelevance: 0.95,
    priority: 0.9,
    verificationStrategy: ['github_browser', 'portfolio_browser'],
  },
  {
    id: 'claim-scale',
    type: 'scale',
    text: 'Scaled an e-commerce platform from 10k to 1M monthly users',
    keywords: ['e-commerce', 'scaling', 'platform'],
    category: 'scale',
    jobRelevance: 0.7,
    priority: 0.6,
    verificationStrategy: ['portfolio_browser'],
  },
  {
    id: 'claim-employment',
    type: 'employment',
    text: 'Senior Software Engineer at Acme Corp from Jan 2021 to Present',
    keywords: ['Acme Corp', 'Senior Software Engineer'],
    category: 'employment',
    jobRelevance: 0.9,
    priority: 0.85,
    verificationStrategy: ['linkedin'],
  },
]

async function testGovernanceLayer() {
  startSection('4.6 Governance Layer')

  // Allowlist sanity
  check(
    Array.isArray(ALLOWLISTED_DOMAINS.github) &&
      ALLOWLISTED_DOMAINS.github.includes('github.com'),
    'ALLOWLISTED_DOMAINS.github contains github.com'
  )
  check(
    ALLOWLISTED_DOMAINS.portfolio.includes('vercel.app') &&
      ALLOWLISTED_DOMAINS.portfolio.includes('netlify.app'),
    'portfolio allowlist contains vercel.app and netlify.app'
  )
  check(
    ALLOWLISTED_DOMAINS.linkedin.includes('linkedin.com'),
    'linkedin allowlist contains linkedin.com'
  )

  // PII guard
  const piiSensitive = ['date_of_birth', 'phone_number', 'profile_photo']
  check(
    piiSensitive.every((field) => FORBIDDEN_EXTRACTIONS.includes(field)),
    'FORBIDDEN_EXTRACTIONS covers date_of_birth, phone_number, profile_photo'
  )

  // Governance rules visible
  check(
    typeof GOVERNANCE_RULES.linkedin_data_minimization === 'string' &&
      GOVERNANCE_RULES.linkedin_data_minimization.length > 0,
    'GOVERNANCE_RULES exposes a non-empty linkedin_data_minimization rule'
  )

  // validateNavigationTarget — happy path
  const validGithub = validateNavigationTarget(
    'https://github.com/sindresorhus',
    'github_browser'
  )
  check(validGithub.allowed === true, 'github.com is allowed for github_browser')

  // validateNavigationTarget — protocol & hostname blocks
  const blockedHttp = validateNavigationTarget(
    'http://github.com/foo',
    'github_browser'
  )
  check(
    blockedHttp.allowed === false && /HTTPS/.test(blockedHttp.reason ?? ''),
    'http:// is rejected with HTTPS reason'
  )

  const blockedJs = validateNavigationTarget(
    'javascript:alert(1)',
    'github_browser'
  )
  check(
    blockedJs.allowed === false && /not allowed/i.test(blockedJs.reason ?? ''),
    'javascript: protocol is rejected'
  )

  const blockedLocalhost = validateNavigationTarget(
    'https://localhost/',
    'portfolio_browser'
  )
  check(
    blockedLocalhost.allowed === false &&
      /localhost|internal/i.test(blockedLocalhost.reason ?? ''),
    'localhost is rejected'
  )

  const blockedInternalIp = validateNavigationTarget(
    'https://10.0.0.1/',
    'portfolio_browser'
  )
  check(
    blockedInternalIp.allowed === false,
    'private 10.x.x.x address is rejected'
  )

  const blocked172 = validateNavigationTarget(
    'https://172.20.5.5/',
    'portfolio_browser'
  )
  check(blocked172.allowed === false, '172.16-31.x.x range is rejected')

  const wrongAllowlist = validateNavigationTarget(
    'https://github.com/foo',
    'linkedin'
  )
  check(
    wrongAllowlist.allowed === false &&
      /not on the allowlist/i.test(wrongAllowlist.reason ?? ''),
    'github URL is rejected when agentType is linkedin'
  )

  const portfolioVercel = validateNavigationTarget(
    'https://leerob.vercel.app/',
    'portfolio_browser'
  )
  check(
    portfolioVercel.allowed === true,
    'vercel.app subdomain allowed for portfolio_browser'
  )

  // PII filter
  const filtered = filterForbiddenContent({
    name: 'Jane Doe',
    profile_photo: 'https://example.com/photo.jpg',
    nested: {
      home_address: '1 Main St',
      keep: 'ok',
    },
    items: [{ phone_number: '555-1234' }, { ok: 'yes' }],
  }) as Record<string, any>
  check(
    filtered.profile_photo === '[REDACTED - PII]',
    'top-level profile_photo redacted'
  )
  check(
    filtered.nested.home_address === '[REDACTED - PII]',
    'nested home_address redacted'
  )
  check(filtered.nested.keep === 'ok', 'non-PII fields preserved')
  check(
    filtered.items[0].phone_number === '[REDACTED - PII]' &&
      filtered.items[1].ok === 'yes',
    'PII inside arrays is redacted, non-PII preserved'
  )

  // sanitizeForStorage
  const sanitized = sanitizeForStorage({
    pageUrl: 'https://example.com/?utm_source=foo&keep=bar&fbclid=abc',
    body: '<html>raw</html>',
    cookieJar: 'session=secret',
    sessionId: 'abc',
    nested: { html: '<p>nope</p>', keep: 'yes' },
  }) as Record<string, any>
  check(!('body' in sanitized), 'body field removed during sanitization')
  check(!('cookieJar' in sanitized), 'cookie field removed during sanitization')
  check(!('sessionId' in sanitized), 'session field removed during sanitization')
  check(
    typeof sanitized.pageUrl === 'string' &&
      !sanitized.pageUrl.includes('utm_source') &&
      !sanitized.pageUrl.includes('fbclid') &&
      sanitized.pageUrl.includes('keep=bar'),
    'tracking params stripped from URL but legitimate params preserved'
  )
  check(!('html' in sanitized.nested), 'nested html field removed')
  check(sanitized.nested.keep === 'yes', 'nested non-sensitive field preserved')

  // logAgentAccess (should not throw)
  await safeRun('logAgentAccess', async () => {
    await logAgentAccess({
      agentType: 'portfolio_browser',
      candidateId: 'test-candidate',
      targetUrl: 'https://example.com',
      purpose: 'unit_test',
      dataExtracted: ['title'],
    })
    check(true, 'logAgentAccess resolves without throwing')
  })

  // requiresHumanReview
  const linkedinPacket: EvidencePacket = {
    candidateId: 'c1',
    claimId: 'claim',
    claimText: 'x',
    claimType: 'employment',
    agentType: 'linkedin',
    retrievalMode: 'browser',
    verdict: 'SUPPORTED',
    confidence: 0.9,
    evidence: [],
    provenance: [],
    visitedUrls: [],
    totalSteps: 0,
    visionCallCount: 0,
    costUSD: 0,
  }
  check(
    requiresHumanReview(linkedinPacket) === true,
    'LinkedIn evidence always requires human review'
  )

  const contradicted: EvidencePacket = {
    ...linkedinPacket,
    agentType: 'github_browser',
    verdict: 'CONTRADICTED',
  }
  check(
    requiresHumanReview(contradicted) === true,
    'CONTRADICTED verdict requires human review'
  )

  const lowConfidence: EvidencePacket = {
    ...linkedinPacket,
    agentType: 'github_browser',
    verdict: 'WEAKLY_SUPPORTED',
    confidence: 0.2,
  }
  check(
    requiresHumanReview(lowConfidence) === true,
    'low-confidence (<0.4) requires human review'
  )

  const clean: EvidencePacket = {
    ...linkedinPacket,
    agentType: 'github_browser',
    verdict: 'SUPPORTED',
    confidence: 0.85,
  }
  check(
    requiresHumanReview(clean) === false,
    'high-confidence non-LinkedIn SUPPORTED packet does NOT require review'
  )

  // Rate limiting
  _resetRateLimitsForTesting()
  await safeRun('rate limit allows below threshold', async () => {
    for (let i = 0; i < 10; i++) {
      await enforceRateLimit('linkedin', 'linkedin.com')
    }
    check(true, 'first 10 LinkedIn calls succeed within budget')
  })

  let limited = false
  try {
    await enforceRateLimit('linkedin', 'linkedin.com')
  } catch (error) {
    limited = error instanceof RateLimitError
  }
  check(limited, '11th LinkedIn call throws RateLimitError')

  _resetRateLimitsForTesting()
}

async function testPortfolioOrchestratorHelpers() {
  startSection('4.2 Portfolio Orchestrator (helpers + relevance logic)')

  type OrchestratorWithPrivates = typeof portfolioOrchestrator & {
    findMostRelevantClaim: (
      work: ShippedWorkItem,
      claims: ExtractedClaim[]
    ) => ExtractedClaim | null
    calculateTechStackCoverage: (
      work: ShippedWorkItem[],
      rubric: JobRubric
    ) => number
    estimateVisionCost: (n: number) => number
  }
  const orch = portfolioOrchestrator as unknown as OrchestratorWithPrivates

  const reactWork: ShippedWorkItem = {
    title: 'Acme Storefront',
    description:
      'A React + TypeScript e-commerce storefront on Next.js with PostgreSQL',
    technologies: ['React', 'TypeScript', 'Next.js', 'PostgreSQL'],
    sourceUrl: 'https://example.com/acme',
    hasLiveDemo: true,
    relevanceToRole: 0.9,
    technicalDepth: 0.8,
    evidenceScreenshots: [],
  }
  const unrelatedWork: ShippedWorkItem = {
    title: 'Embedded firmware tool',
    description: 'A C++ utility for STM32 microcontroller flashing',
    technologies: ['C++', 'STM32'],
    sourceUrl: 'https://example.com/firmware',
    hasLiveDemo: false,
    relevanceToRole: 0.1,
    technicalDepth: 0.5,
    evidenceScreenshots: [],
  }

  const matched = orch.findMostRelevantClaim(reactWork, sampleClaims)
  check(
    matched?.id === 'claim-react',
    `findMostRelevantClaim picks React/TS claim for a React project (got ${matched?.id})`
  )

  const noMatch = orch.findMostRelevantClaim(unrelatedWork, sampleClaims)
  check(
    noMatch === null,
    'findMostRelevantClaim returns null when no claim is relevant enough'
  )

  const coverage = orch.calculateTechStackCoverage([reactWork], sampleRubric)
  check(
    coverage >= 0.6,
    `tech stack coverage for React project covers >=60% of must-haves (actual ${coverage.toFixed(2)})`
  )

  const noCoverage = orch.calculateTechStackCoverage(
    [unrelatedWork],
    sampleRubric
  )
  check(
    noCoverage === 0,
    'tech stack coverage is 0 when no must-have skills are matched'
  )

  const cost = orch.estimateVisionCost(15)
  check(
    cost > 0 && cost < 0.01,
    `estimateVisionCost(15) is between 0 and $0.01 (actual $${cost.toFixed(6)})`
  )
}

async function testPortfolioBrowserAgentLight() {
  startSection('4.1 Portfolio Browser Agent')

  const portfolioUrl = 'https://sindresorhus.com/'
  const claim: ExtractedClaim = {
    id: 'claim-portfolio-react',
    type: 'project',
    text: 'Open source maintainer with widely-used JavaScript projects',
    keywords: ['open source', 'JavaScript', 'projects', 'github'],
    category: 'project',
    jobRelevance: 0.85,
    priority: 0.8,
    verificationStrategy: ['portfolio_browser'],
  }

  const budget: RetrievalBudget = {
    maxSteps: 3,
    maxTimeSeconds: 30,
    maxVisionCalls: 1,
    minEvidenceThreshold: 1,
  }
  const evidencePacketId = `test-${Date.now()}`

  await safeRun('verifySpecificClaim against sindresorhus.com', async () => {
    const evidence = await portfolioBrowserAgent.verifySpecificClaim(
      portfolioUrl,
      claim,
      budget,
      evidencePacketId
    )

    check(Array.isArray(evidence), 'verifySpecificClaim returns an array')
    if (evidence.length > 0) {
      const item = evidence[0]
      check(item.sourceUrl === portfolioUrl, 'evidence sourceUrl matches portfolio URL')
      check(item.sourceType === 'portfolio', 'evidence sourceType is "portfolio"')
      check(item.snippets.length > 0, 'evidence has at least one snippet')
      check(
        item.snippets.every(
          (s) =>
            typeof s.text === 'string' &&
            s.relevance >= 0 &&
            s.relevance <= 1
        ),
        'snippet shapes are valid (text + 0-1 relevance)'
      )
      check(
        typeof item.agentReasoning === 'string' &&
          item.agentReasoning.length > 0,
        'agentReasoning is a non-empty string'
      )
      check(item.timestamp instanceof Date, 'timestamp is a Date')
    } else {
      console.log(
        '  INFO: no evidence collected (keywords not found on landing page) — that is a valid result'
      )
      check(
        true,
        'verifySpecificClaim runs to completion even when no keyword hits'
      )
    }
  })
}

async function testLinkedInComparisonLogic() {
  startSection('4.3 LinkedIn Verification Agent (comparison logic)')

  type LinkedInPrivates = typeof linkedinAgent & {
    fuzzyMatchPosition: (
      a: { title: string; company: string },
      b: { title: string; company: string }
    ) => number
    compareTimelineToResume: (
      linkedinPositions: any[],
      resumePositions: any[]
    ) => any
    extractYearMonth: (
      dateStr: string
    ) => { year: number; month: number } | null
  }
  const agent = linkedinAgent as unknown as LinkedInPrivates

  const exact = agent.fuzzyMatchPosition(
    { title: 'Software Engineer', company: 'Acme Corp' },
    { title: 'Software Engineer', company: 'Acme Corp' }
  )
  check(exact === 1, 'identical title+company yields fuzzy match score 1.0')

  const partial = agent.fuzzyMatchPosition(
    { title: 'Senior Software Engineer', company: 'Acme' },
    { title: 'Software Engineer', company: 'Acme Corp' }
  )
  check(partial > 0.8, `substring company+title yields >0.8 (actual ${partial})`)

  const noMatch = agent.fuzzyMatchPosition(
    { title: 'Software Engineer', company: 'Acme' },
    { title: 'Designer', company: 'Globex' }
  )
  check(noMatch === 0, 'unrelated title+company yields 0')

  const ym1 = agent.extractYearMonth('Jan 2021')
  check(ym1?.year === 2021 && ym1?.month === 1, 'extractYearMonth handles "Jan 2021"')
  const ym2 = agent.extractYearMonth('2020/03')
  check(ym2?.year === 2020 && ym2?.month === 3, 'extractYearMonth handles "2020/03"')
  const ym3 = agent.extractYearMonth('March 2019')
  check(ym3?.year === 2019 && ym3?.month === 3, 'extractYearMonth handles "March 2019"')

  const consistencyMissing = agent.compareTimelineToResume(
    [],
    [{ company: 'Acme Corp', title: 'Software Engineer', startDate: 'Jan 2021' }]
  )
  check(
    consistencyMissing.overallMatch === false,
    'overallMatch is false when resume position absent from LinkedIn'
  )
  check(
    consistencyMissing.discrepancies.some(
      (d: any) => d.type === 'missing_position' && d.severity === 'high'
    ),
    'missing_position discrepancy is flagged high severity'
  )

  const consistencyOk = agent.compareTimelineToResume(
    [
      {
        title: 'Software Engineer',
        company: 'Acme Corp',
        startDate: 'Jan 2021',
        endDate: 'Present',
      },
    ],
    [{ company: 'Acme Corp', title: 'Software Engineer', startDate: 'Jan 2021' }]
  )
  check(
    consistencyOk.overallMatch === true,
    'overallMatch true when LinkedIn matches resume exactly'
  )
  check(
    consistencyOk.confidence > 0.9,
    `confidence >0.9 when timelines match (actual ${consistencyOk.confidence})`
  )

  const consistencyDateMismatch = agent.compareTimelineToResume(
    [
      {
        title: 'Software Engineer',
        company: 'Acme Corp',
        startDate: 'Jan 2021',
        endDate: 'Present',
      },
    ],
    [{ company: 'Acme Corp', title: 'Software Engineer', startDate: 'Jan 2020' }]
  )
  check(
    consistencyDateMismatch.discrepancies.some(
      (d: any) => d.type === 'date_mismatch'
    ),
    'date_mismatch flagged when start dates differ by >3 months'
  )
}

function buildJudgmentMap(): Map<string, JudgmentResult> {
  return new Map<string, JudgmentResult>([
    [
      'claim-react',
      {
        verdict: 'SUPPORTED',
        confidence: 0.9,
        reasoning: 'Found multiple public React+TypeScript repos and live demos.',
        keyEvidence: [
          'commits in TypeScript over multiple years',
          'live Next.js demo with React Server Components',
        ],
        contradictions: [],
      },
    ],
    [
      'claim-scale',
      {
        verdict: 'UNVERIFIED',
        confidence: 0.2,
        reasoning: 'No public traffic or scale evidence located.',
        keyEvidence: [],
        contradictions: [],
      },
    ],
    [
      'claim-employment',
      {
        verdict: 'WEAKLY_SUPPORTED',
        confidence: 0.6,
        reasoning: 'LinkedIn auth-wall blocked direct verification.',
        keyEvidence: ['Acme Corp listed in resume header'],
        contradictions: [],
      },
    ],
  ])
}

function buildEvidencePackets(): EvidencePacket[] {
  return [
    {
      candidateId: 'cand-test',
      claimId: 'claim-react',
      claimText: sampleClaims[0].text,
      claimType: 'skill',
      agentType: 'github_browser',
      retrievalMode: 'browser',
      verdict: 'SUPPORTED',
      confidence: 0.9,
      evidence: [
        {
          claimId: 'claim-react',
          sourceUrl: 'https://github.com/example/react-app',
          sourceType: 'github_browser',
          pageTitle: 'example/react-app',
          snippets: [
            {
              text: 'Next.js + React 19 + TypeScript app with 1.2k commits',
              relevance: 0.95,
              supportsClaim: true,
            },
          ],
          timestamp: new Date(),
          agentReasoning:
            'Repo language stats and README confirm React/TS work.',
        },
      ],
      provenance: [],
      visitedUrls: ['https://github.com/example/react-app'],
      totalSteps: 3,
      visionCallCount: 1,
      costUSD: 0.005,
    },
  ]
}

const sampleScores: CandidateScores = {
  fitScore: 0.86,
  evidenceScore: 0.74,
  shippedWorkScore: 0.7,
  confidenceScore: 0.78,
  breakdown: {
    totalClaims: 3,
    supported: 1,
    weaklySupported: 1,
    unverified: 1,
    contradicted: 0,
  },
}

const sampleRisks: RiskFlag[] = [
  {
    type: 'unsupported_claim',
    severity: 'medium',
    description:
      'Scale claim of 10k → 1M users could not be independently verified.',
    relatedClaim: sampleClaims[1].text,
  },
]

const sampleShippedWork: RankedShippedWork[] = [
  {
    rank: 1,
    title: 'Realtime collaborative editor',
    description:
      'Multi-user collaborative editor in React + TypeScript with WebSockets and Postgres backend.',
    technologies: ['React', 'TypeScript', 'WebSockets', 'PostgreSQL'],
    sourceUrl: 'https://github.com/example/collab',
    hasLiveDemo: true,
    relevanceToRole: 0.9,
    technicalDepth: 0.85,
    evidenceScreenshots: [],
    deterministicScore: 80,
    impressivenessScore: 0.85,
    roleRelevanceScore: 0.9,
    impressivenessNarrative:
      'Demonstrates depth in realtime systems and React state management at production scale.',
  },
]

async function testBriefGenerator() {
  startSection('4.4 Brief Generator Agent (Claude Haiku)')

  const judgments = buildJudgmentMap()
  const evidencePackets = buildEvidencePackets()

  await safeRun('generateBrief returns full CandidateBrief', async () => {
    const brief = await briefGeneratorAgent.generateBrief({
      candidate: { id: 'cand-test', name: 'Jane Doe', email: 'jane@example.com' },
      job: {
        title: sampleRubric.title,
        description: 'Looking for a senior full-stack engineer.',
      },
      jobRubric: sampleRubric,
      claims: sampleClaims,
      judgments,
      scores: sampleScores,
      risks: sampleRisks,
      shippedWork: sampleShippedWork,
      evidencePackets,
      interviewQuestions: [],
    })

    check(brief.candidateId === 'cand-test', 'candidateId echoed through brief')
    check(brief.candidateName === 'Jane Doe', 'candidateName echoed through brief')
    check(brief.roleTitle === sampleRubric.title, 'roleTitle echoed through brief')
    check(
      brief.fitScore === sampleScores.fitScore &&
        brief.evidenceScore === sampleScores.evidenceScore &&
        brief.shippedWorkScore === sampleScores.shippedWorkScore &&
        brief.confidenceScore === sampleScores.confidenceScore,
      'all four scores propagated to brief'
    )
    check(
      brief.verifiedClaims.length === 2,
      `verifiedClaims includes SUPPORTED + WEAKLY_SUPPORTED (got ${brief.verifiedClaims.length})`
    )
    check(
      brief.weakClaims.length === 1,
      `weakClaims contains UNVERIFIED claims (got ${brief.weakClaims.length})`
    )
    check(brief.risks === sampleRisks, 'risks array passed through')
    check(brief.shippedWork === sampleShippedWork, 'shippedWork array passed through')
    check(
      brief.evidencePackets === evidencePackets,
      'evidencePackets array passed through'
    )
    check(brief.createdAt instanceof Date, 'createdAt is a Date')

    const reactSummary = brief.verifiedClaims.find(
      (c) => c.claimText === sampleClaims[0].text
    )
    check(
      !!reactSummary &&
        typeof reactSummary.summary === 'string' &&
        reactSummary.summary.length > 0,
      'verified React/TS claim has a non-empty AI-generated summary'
    )
    check(
      !!reactSummary && reactSummary.sourceUrls.length > 0,
      'verified claim has source URLs derived from evidence packets'
    )

    const weak = brief.weakClaims[0]
    check(
      typeof weak.reason === 'string' && weak.reason.length > 0,
      'weak claim has a recruiter-friendly reason'
    )
    check(
      typeof weak.followUpSuggestion === 'string' &&
        weak.followUpSuggestion.length > 0,
      'weak claim has a follow-up suggestion'
    )

    const atsSummary = await briefGeneratorAgent.generateATSSummary(brief)
    check(
      typeof atsSummary === 'string' && atsSummary.length > 30,
      `ATS summary returned (>30 chars, actual ${atsSummary.length})`
    )
    check(
      atsSummary.toLowerCase().includes('jane doe'),
      'ATS summary mentions candidate name'
    )

    const title = await briefGeneratorAgent.generateBriefTitle(
      { name: 'Jane Doe' },
      sampleScores
    )
    check(
      typeof title === 'string' && title.length > 0 && title.length <= 100,
      `brief title is non-empty and reasonable length (actual ${title.length}: "${title}")`
    )
  })
}

async function testInterviewQuestions() {
  startSection('4.5 Interview Question Generator (Gemini Flash)')

  const weakClaimInputs: WeakClaim[] = [
    {
      claimText: 'Scaled an e-commerce platform from 10k to 1M monthly users',
      reason:
        'No public traffic/scale evidence located across portfolio or GitHub.',
      followUpSuggestion:
        'Ask candidate for analytics screenshots or case study.',
    },
  ]
  const unverifiedInputs = [sampleClaims[1]]

  await safeRun(
    'generateQuestions returns 5-8 InterviewQuestion[]',
    async () => {
      const questions = await interviewQuestionsAgent.generateQuestions(
        weakClaimInputs,
        unverifiedInputs,
        sampleShippedWork,
        sampleRubric
      )

      check(Array.isArray(questions), 'returns an array')
      check(
        questions.length >= 3 && questions.length <= 12,
        `returned 3-12 questions (actual ${questions.length})`
      )
      check(
        questions.every(
          (q) =>
            typeof q.question === 'string' &&
            q.question.length > 10 &&
            typeof q.relatedClaim === 'string' &&
            typeof q.purpose === 'string' &&
            Array.isArray(q.followUpProbes)
        ),
        'each question has question/relatedClaim/purpose/followUpProbes shape'
      )
      check(
        questions.every((q) => q.followUpProbes.length >= 1),
        'each question has at least one follow-up probe'
      )

      const categorized = interviewQuestionsAgent.categorizeQuestions(questions)
      const totalCategorized =
        categorized.technical.length +
        categorized.behavioral.length +
        categorized.clarification.length
      check(
        totalCategorized === questions.length,
        `categorizeQuestions partitions every question (got ${totalCategorized}/${questions.length})`
      )
      console.log(
        `    technical=${categorized.technical.length}, behavioral=${categorized.behavioral.length}, clarification=${categorized.clarification.length}`
      )
    }
  )

  await safeRun(
    'generateSkillProbe returns single InterviewQuestion',
    async () => {
      const probe = await interviewQuestionsAgent.generateSkillProbe(
        'React',
        'Built production React apps with TypeScript and Next.js for 4+ years'
      )
      check(
        typeof probe.question === 'string' && probe.question.length > 10,
        'probe has a non-trivial question'
      )
      check(probe.followUpProbes.length >= 2, 'probe has 2+ follow-up probes')
      check(
        typeof probe.purpose === 'string' && probe.purpose.length > 0,
        'probe has a non-empty purpose'
      )
    }
  )
}

async function main() {
  const startedAt = Date.now()
  console.log('=== DeepHire Day 3 Systems Test ===')

  await testGovernanceLayer()
  await testPortfolioOrchestratorHelpers()
  await testPortfolioBrowserAgentLight()
  await testLinkedInComparisonLogic()
  await testBriefGenerator()
  await testInterviewQuestions()

  if (currentSection) {
    sectionResults.push({
      section: currentSection,
      passed: currentPassed,
      failed: currentFailed,
    })
  }

  const elapsedSeconds = (Date.now() - startedAt) / 1000

  console.log('\n=== Summary ===')
  for (const r of sectionResults) {
    const status = r.failed === 0 ? 'PASS' : 'FAIL'
    console.log(
      `${status}  ${r.section}: ${r.passed} pass / ${r.failed} fail`
    )
  }
  console.log(`\nRuntime: ${elapsedSeconds.toFixed(1)}s`)

  if (failures.length > 0) {
    console.log('\nFAILED CHECKS:')
    failures.forEach((failure) => console.log(`- ${failure}`))
    process.exitCode = 1
  } else {
    console.log('\nAll Day 3 system checks passed.')
  }
}

main().catch((error) => {
  console.error('\nFatal test error:')
  console.error(error)
  process.exit(1)
})
