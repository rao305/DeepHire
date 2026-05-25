import 'dotenv/config'

import { chromium } from 'playwright'
import * as fs from 'fs'
import { parseResumePDF } from '../src/lib/pdf-parser'
import { jdParserAgent } from '../src/agents/jd-parser.agent'
import { claimExtractorAgent } from '../src/agents/claim-extractor.agent'
import { claimPrioritizerAgent } from '../src/agents/claim-prioritizer.agent'
import { visionPlanner } from '../src/agents/vision-planner'
import { evidenceJudgeAgent } from '../src/agents/evidence/evidence-judge.agent'
import type { Evidence, ExtractedClaim, JobRubric } from '../src/types'

const internshipRequirements = `
Basic Qualifications
Education Status: Currently pursuing a Bachelor's or higher in Computer Science, Computer Engineering, Mathematics, or a related technical discipline. You must be continuing in your degree following the internship.
Graduation Timeline: Usually requires completion of your sophomore or junior year by the program's start date, graduating on or around August 2027 or earlier depending on the cycle.
Work Authorization: Must be legally authorized to work in the United States without employer sponsorship for both the internship and full-time employment.

Technical Requirements
Coding Experience: Intermediate to advanced programming proficiency.
Tech Stack: Familiarity with languages such as Java, Python, Go, Kotlin, C/C++, JavaScript, or Swift.
Concepts: Strong grasp of foundational computer science concepts, including data structures, algorithms, and software design.

Soft Skills
Strong analytical, quantitative, and problem-solving skills.
Excellent interpersonal and communication skills for working in collaborative, Agile teams.

Program Details & Application Process
Program Length: The standard paid internship lasts 10 weeks over the summer (typically June to August).
Locations: Usually hosted as a hybrid model at major tech hubs like McLean, VA, New York City, or Plano, TX.
Interview Process: Following a resume screening, applicants typically complete a coding assessment (similar to HackerRank or a CodeSignal) before moving on to technical interviews (often testing Data Structures & Algorithms).
`

const resumePath = './resume sample/resume (1).pdf'
const failures: string[] = []

function check(condition: unknown, message: string) {
  if (condition) {
    console.log(`  PASS: ${message}`)
  } else {
    failures.push(message)
    console.log(`  FAIL: ${message}`)
  }
}

function weightSum(rubric: JobRubric) {
  return Object.values(rubric.weights).reduce((sum, value) => sum + value, 0)
}

function extractLinks(text: string) {
  const urls = Array.from(text.matchAll(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s),]*)?/g))
    .map((match) => match[0].replace(/[.,)]$/, ''))

  return {
    github: urls.find((url) => url.toLowerCase().includes('github.com')),
    linkedin: urls.find((url) => url.toLowerCase().includes('linkedin.com')),
    portfolio: urls.find((url) => {
      const lower = url.toLowerCase()
      return !lower.includes('github.com') && !lower.includes('linkedin.com')
    }),
  }
}

function pickRepresentativeClaim(claims: ExtractedClaim[]) {
  return (
    claims.find((claim) => claim.type === 'skill') ||
    claims.find((claim) => claim.type === 'project') ||
    claims[0]
  )
}

async function main() {
  const startedAt = Date.now()
  console.log('=== DeepHire Day 2 Resume E2E Test ===')
  console.log(`Resume: ${resumePath}`)

  console.log('\n2.1 PDF Parser')
  const buffer = fs.readFileSync(resumePath)
  const parsedResume = await parseResumePDF(buffer)
  check(parsedResume.rawText.trim().length > 0, 'rawText is not empty')
  check(parsedResume.cleanedText.trim().length > 0, 'cleanedText is not empty')
  check(!/[\u0000\uFFFD]/.test(parsedResume.cleanedText), 'cleanedText has no null or replacement characters')
  check(Number.isFinite(parsedResume.metadata.pageCount) && parsedResume.metadata.pageCount >= 1, 'metadata.pageCount is a number >= 1')
  console.log(`  Pages: ${parsedResume.metadata.pageCount}`)
  console.log(`  Extracted URLs: ${parsedResume.metadata.extractedUrls.join(', ') || 'none'}`)
  console.log(`  Preview: ${parsedResume.cleanedText.slice(0, 240).replace(/\s+/g, ' ')}...`)

  console.log('\n2.2 JD Parser Agent')
  const rubric = await jdParserAgent.parseJobDescription(internshipRequirements)
  console.log(JSON.stringify(rubric, null, 2))
  const sum = weightSum(rubric)
  check(['junior', 'mid', 'senior', 'staff', 'principal'].includes(rubric.seniority), 'seniority is a valid enum')
  check(rubric.mustHaveSkills.length > 0, 'mustHaveSkills is not empty')
  check(rubric.mustHaveSkills.some((skill) => /java|python|javascript|c\+\+|go|swift|kotlin/i.test(skill)), 'mustHaveSkills includes internship programming languages')
  check(Math.abs(sum - 1) <= 0.01, `weights sum to 1.0 (actual ${sum.toFixed(4)})`)

  console.log('\n2.3 Claim Extractor Agent')
  const claims = await claimExtractorAgent.extractClaims(parsedResume.cleanedText, rubric)
  claims.forEach((claim, index) => {
    console.log(`${index + 1}. [${claim.type}] ${claim.text}`)
    console.log(`   Relevance: ${claim.jobRelevance} | Priority: ${claim.priority}`)
    console.log(`   Strategy: ${claim.verificationStrategy.join(', ') || 'none'}`)
    console.log(`   Keywords: ${claim.keywords.join(', ') || 'none'}`)
  })
  check(claims.length >= 3, `at least 3 claims extracted (actual ${claims.length})`)
  check(claims.some((claim) => claim.type === 'skill'), 'claims include at least one skill claim')
  check(claims.every((claim) => claim.verificationStrategy.length > 0), 'each claim has at least one verification strategy')
  check(claims.every((claim) => claim.keywords.length > 0), 'no claim has an empty keywords array')

  console.log('\n--- AI Polish Detection ---')
  const polish = await claimExtractorAgent.detectAIPolishing(parsedResume.cleanedText, internshipRequirements)
  console.log(JSON.stringify(polish, null, 2))
  check(polish.score >= 0 && polish.score <= 1, 'AI polish score is between 0 and 1')

  console.log('\n2.4 Claim Prioritizer')
  const links = extractLinks(parsedResume.cleanedText)
  console.log(`  Links used: ${JSON.stringify(links)}`)
  const plan = claimPrioritizerAgent.prioritizeClaims(claims, rubric, links, 5)
  plan.highPriority.forEach((task) => {
    console.log(`  HIGH: ${task.claim.text}`)
    console.log(`    Agents: ${task.agents.join(', ')} | Cost: $${task.estimatedCost.toFixed(4)}`)
    console.log(`    Budget: ${task.budget.maxSteps} steps, ${task.budget.maxVisionCalls} vision calls, ${task.budget.maxTimeSeconds}s`)
  })
  plan.mediumPriority.forEach((task) => {
    console.log(`  MEDIUM: ${task.claim.text}`)
    console.log(`    Agents: ${task.agents.join(', ')} | Cost: $${task.estimatedCost.toFixed(4)}`)
  })
  plan.skip.forEach((skipped) => console.log(`  SKIP: ${skipped.claim.text} (${skipped.reason})`))
  check(plan.highPriority.length + plan.mediumPriority.length > 0, 'prioritizer selected at least one verification task')
  check(plan.estimatedTotalCost >= 0 && plan.estimatedTotalCost < 0.5, `estimatedTotalCost is under $0.50 (actual $${plan.estimatedTotalCost.toFixed(4)})`)
  check([...plan.highPriority, ...plan.mediumPriority].every((task) => task.budget.maxSteps > 0 && task.budget.maxVisionCalls > 0 && task.budget.maxTimeSeconds > 0), 'each selected task has a complete budget')

  console.log('\n2.5 Vision Planner')
  const representativeClaim = pickRepresentativeClaim(claims)
  if (representativeClaim) {
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto('https://github.com/sindresorhus', {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    })
    const screenshot = await page.screenshot({ type: 'png', scale: 'css' })
    const pageText = await page.evaluate(() => document.body.innerText)
    await browser.close()

    const visionStartedAt = Date.now()
    const action = await visionPlanner.decideNextAction(
      {
        claim: representativeClaim,
        currentUrl: 'https://github.com/sindresorhus',
        visitedUrls: ['https://github.com/sindresorhus'],
        evidenceCollected: [],
        stepsTaken: 1,
        timeElapsed: 2,
        lastScreenshot: screenshot,
        pageText,
        budget: {
          maxSteps: 10,
          maxVisionCalls: 8,
          maxTimeSeconds: 60,
          minEvidenceThreshold: 0.7,
        },
      },
      ['github.com', 'raw.githubusercontent.com'],
      {
        name: 'GitHub Research Agent',
        goal: `Find evidence for resume claim: ${representativeClaim.text}`,
        expertise: ['GitHub repos', 'code quality', 'README assessment'],
      }
    )
    console.log(JSON.stringify(action, null, 2))
    check(['navigate', 'click', 'scroll', 'extract', 'done'].includes(action.type), `vision action type is valid (${action.type})`)
    check(action.reasoning.trim().length > 0, 'vision reasoning is non-empty')
    check(Date.now() - visionStartedAt < 10_000, 'vision planner responded in under 10 seconds')
  } else {
    check(false, 'vision planner had a representative claim to test')
  }

  console.log('\n2.6 Evidence Judge Agent')
  const claimForJudgment = representativeClaim
  if (claimForJudgment) {
    const strongEvidence: Evidence[] = [
      {
        claimId: claimForJudgment.id,
        sourceUrl: links.github || links.portfolio || 'https://example.com/candidate',
        sourceType: links.github ? 'github_browser' : 'portfolio_browser',
        pageTitle: 'Candidate public evidence',
        snippets: [
          {
            text: `Public evidence explicitly supports this resume claim: ${claimForJudgment.text}`,
            relevance: 0.95,
            supportsClaim: true,
          },
        ],
        timestamp: new Date(),
        agentReasoning: 'Synthetic strong evidence for Day 2 judge smoke test',
      },
    ]

    const weakEvidence: Evidence[] = [
      {
        claimId: claimForJudgment.id,
        sourceUrl: links.github || links.portfolio || 'https://example.com/candidate',
        sourceType: 'github_api',
        pageTitle: 'Candidate profile',
        snippets: [
          {
            text: 'Profile contains broad technical activity but no direct proof of this exact claim.',
            relevance: 0.35,
            supportsClaim: 'uncertain',
          },
        ],
        timestamp: new Date(),
        agentReasoning: 'Only indirect signal available',
      },
    ]

    const strongResult = await evidenceJudgeAgent.judgeEvidence(claimForJudgment, strongEvidence, 'Resume Candidate')
    const weakResult = await evidenceJudgeAgent.judgeEvidence(claimForJudgment, weakEvidence, 'Resume Candidate')
    console.log('Strong:', JSON.stringify(strongResult, null, 2))
    console.log('Weak:', JSON.stringify(weakResult, null, 2))
    check(['SUPPORTED', 'WEAKLY_SUPPORTED'].includes(strongResult.verdict), `strong evidence is supported or weakly supported (${strongResult.verdict})`)
    check(strongResult.confidence >= 0.7 && strongResult.confidence <= 1, `strong confidence is 0.7-1.0 (${strongResult.confidence})`)
    check(['WEAKLY_SUPPORTED', 'UNVERIFIED'].includes(weakResult.verdict), `weak evidence is weakly supported or unverified (${weakResult.verdict})`)
    check(weakResult.confidence <= strongResult.confidence, 'weak evidence confidence is not higher than strong evidence confidence')

    const scores = evidenceJudgeAgent.calculateScores(
      [claimForJudgment],
      new Map([[claimForJudgment.id, strongResult]]),
      rubric
    )
    console.log('Scores:', JSON.stringify(scores, null, 2))
    check([scores.fitScore, scores.evidenceScore, scores.shippedWorkScore, scores.confidenceScore].every((score) => Number.isFinite(score) && score >= 0 && score <= 1), 'calculateScores returns scores between 0 and 1')
  } else {
    check(false, 'evidence judge had a claim to test')
  }

  const elapsedSeconds = (Date.now() - startedAt) / 1000
  console.log('\n=== Summary ===')
  console.log(`Claims found: ${claims.length}`)
  console.log(`Selected tasks: ${plan.highPriority.length} high, ${plan.mediumPriority.length} medium`)
  console.log(`Estimated verification cost: $${plan.estimatedTotalCost.toFixed(4)}`)
  console.log(`Runtime: ${elapsedSeconds.toFixed(1)}s`)

  if (failures.length > 0) {
    console.log('\nFAILED CHECKS:')
    failures.forEach((failure) => console.log(`- ${failure}`))
    process.exitCode = 1
  } else {
    console.log('\nAll Day 2 resume E2E checks passed.')
  }
}

main().catch((error) => {
  console.error('\nFatal test error:')
  console.error(error)
  process.exit(1)
})
