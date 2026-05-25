import { openrouter, MODELS, parseAIJson } from '@/lib/ai'
import type {
  AgentContext,
  AgentAction,
  ExtractedClaim,
  EvidenceSnippet,
} from '@/types'

interface PageAssessment {
  isRelevant: boolean
  relevanceScore: number
  keyFindings: string[]
}

interface AgentPersona {
  name: string
  goal: string
  expertise: string[]
}

export class VisionPlanner {
  async decideNextAction(
    context: AgentContext,
    allowedDomains: string[],
    agentPersona: AgentPersona
  ): Promise<AgentAction> {
    try {
      const prompt = this.buildDecisionPrompt(context, allowedDomains, agentPersona)

      if (!context.lastScreenshot) {
        return {
          type: 'done',
          reasoning: 'No screenshot available for vision analysis',
          doneReason: 'missing_screenshot',
        }
      }

      const response = await openrouter.chat.completions.create({
        model: MODELS.FAST,
        max_tokens: 600,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${context.lastScreenshot.toString('base64')}`,
                },
              },
            ],
          },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from vision model')
      }

      return this.validateAndParseAction(content, allowedDomains)
    } catch (error) {
      console.error('Vision decision error:', error)

      // Fallback: try text-only analysis
      if (context.pageText) {
        try {
          return await this.textOnlyFallback(context, allowedDomains, agentPersona)
        } catch (fallbackError) {
          console.error('Text fallback failed:', fallbackError)
        }
      }

      // Final fallback: scroll to see more content
      return {
        type: 'scroll',
        reasoning: 'Vision API failed, scrolling to explore page content',
      }
    }
  }

  async quickPageAssessment(
    screenshot: Buffer,
    pageText: string,
    claim: ExtractedClaim
  ): Promise<PageAssessment> {
    try {
      const prompt = `Is this page relevant to verifying the claim: "${claim.text}"?

Claim type: ${claim.type}
Keywords: ${claim.keywords.join(', ')}

Analyze the page and return JSON with:
- isRelevant: boolean (is this page helpful for verification?)
- relevanceScore: number 0-1 (how relevant is the content?)
- keyFindings: string[] (what key information did you spot?)

Focus on finding evidence of: ${claim.keywords.slice(0, 3).join(', ')}`

      const response = await openrouter.chat.completions.create({
        model: MODELS.FAST,
        max_tokens: 400,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot.toString('base64')}`,
                },
              },
            ],
          },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty assessment response')
      }

      return parseAIJson<PageAssessment>(content)
    } catch (error) {
      console.error('Page assessment error:', error)

      // Fallback: text-based heuristic
      const hasKeywords = claim.keywords.some((kw) =>
        pageText.toLowerCase().includes(kw.toLowerCase())
      )

      return {
        isRelevant: hasKeywords,
        relevanceScore: hasKeywords ? 0.5 : 0.2,
        keyFindings: hasKeywords
          ? [`Found keywords: ${claim.keywords.filter((kw) => pageText.includes(kw)).join(', ')}`]
          : ['No clear matches found'],
      }
    }
  }

  async extractStructuredEvidence(
    screenshot: Buffer,
    pageText: string,
    claim: ExtractedClaim
  ): Promise<EvidenceSnippet[]> {
    try {
      const prompt = `Extract ALL text snippets from this page that are relevant to verifying: "${claim.text}"

Claim type: ${claim.type}
Focus areas: ${claim.keywords.join(', ')}

For each relevant snippet, return:
- text: string (EXACT text from the page, copy verbatim)
- relevance: number 0-1 (how relevant is this to the claim?)
- supportsClaim: boolean | "uncertain" (does this support, contradict, or uncertain?)
- context: string (optional - surrounding context)

Return JSON array of snippets. Be thorough - extract ALL relevant information.
Look for: project names, technologies, dates, metrics, descriptions.`

      const response = await openrouter.chat.completions.create({
        model: MODELS.FAST,
        max_tokens: 1200,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot.toString('base64')}`,
                },
              },
            ],
          },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty evidence extraction response')
      }

      const parsed = parseAIJson<{ snippets: EvidenceSnippet[] }>(content)
      return parsed.snippets || []
    } catch (error) {
      console.error('Evidence extraction error:', error)

      // Fallback: keyword-based extraction from text
      return this.extractEvidenceFromText(pageText, claim)
    }
  }

  private buildDecisionPrompt(
    context: AgentContext,
    allowedDomains: string[],
    persona: AgentPersona
  ): string {
    const contextStr = this.buildContextString(context)

    return `You are ${persona.name}, a ${persona.expertise.join(', ')} expert.
Your goal: ${persona.goal}

${contextStr}

Analyze the screenshot and decide the next action. Return JSON with:
{
  "type": "navigate" | "click" | "scroll" | "extract" | "done",
  "target": "URL or element description (for navigate/click)",
  "reasoning": "why you chose this action",
  "expectedOutcome": "what you expect to find/achieve",
  "extractedEvidence": [ { "text": "...", "relevance": 0-1, "supportsClaim": true/false/"uncertain" } ] (only for extract),
  "doneReason": "success" | "no_evidence" | "budget_exhausted" (only for done)
}

Rules:
- Only navigate to domains: ${allowedDomains.join(', ')}
- Focus on finding evidence for: ${context.claim.keywords.join(', ')}
- Extract when you find relevant content
- Mark done when: sufficient evidence found OR no more relevant links OR budget exhausted
- Prefer clicking specific links over scrolling
- Look for: project READMEs, code samples, deployment URLs, technology stacks`
  }

  private buildContextString(context: AgentContext): string {
    const evidenceCount = context.evidenceCollected.length
    const stepsRemaining = context.budget.maxSteps - context.stepsTaken

    return `CLAIM: "${context.claim.text}"
Type: ${context.claim.type}
Keywords: ${context.claim.keywords.join(', ')}

CURRENT STATE:
- URL: ${context.currentUrl}
- Steps: ${context.stepsTaken}/${context.budget.maxSteps} (${stepsRemaining} remaining)
- Evidence collected: ${evidenceCount} items
- Visited URLs: ${context.visitedUrls.length}

BUDGET:
- Max steps: ${context.budget.maxSteps}
- Max vision calls: ${context.budget.maxVisionCalls}
- Max time: ${context.budget.maxTimeSeconds}s

Page summary (first 500 chars):
${context.pageText.slice(0, 500)}...`
  }

  private validateAndParseAction(
    rawContent: string,
    allowedDomains: string[]
  ): AgentAction {
    try {
      const action = parseAIJson<AgentAction>(rawContent)

      // Validate action type
      const validTypes = ['navigate', 'click', 'scroll', 'extract', 'done']
      if (!validTypes.includes(action.type)) {
        throw new Error(`Invalid action type: ${action.type}`)
      }

      // Validate navigate action
      if (action.type === 'navigate' && action.target) {
        const targetUrl = new URL(action.target)
        const isAllowed = allowedDomains.some((domain) =>
          targetUrl.hostname.includes(domain)
        )

        if (!isAllowed) {
          console.warn(`Blocked navigation to disallowed domain: ${action.target}`)
          return {
            type: 'scroll',
            reasoning: `Navigation to ${targetUrl.hostname} not allowed. Exploring current page.`,
          }
        }
      }

      // Validate extract action
      if (action.type === 'extract' && !action.extractedEvidence) {
        throw new Error('Extract action missing extractedEvidence array')
      }

      return action
    } catch (error) {
      console.error('Action parse error:', error)

      // Return safe fallback
      return {
        type: 'scroll',
        reasoning: 'Failed to parse vision decision, scrolling to see more content',
      }
    }
  }

  private async textOnlyFallback(
    context: AgentContext,
    allowedDomains: string[],
    persona: AgentPersona
  ): Promise<AgentAction> {
    const prompt = this.buildDecisionPrompt(context, allowedDomains, persona)

    const response = await openrouter.chat.completions.create({
      model: MODELS.FAST,
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty text fallback response')
    }

    return this.validateAndParseAction(content, allowedDomains)
  }

  private extractEvidenceFromText(
    pageText: string,
    claim: ExtractedClaim
  ): EvidenceSnippet[] {
    const snippets: EvidenceSnippet[] = []
    const lines = pageText.split('\n')

    // Find lines containing claim keywords
    for (const keyword of claim.keywords.slice(0, 5)) {
      const matchingLines = lines.filter((line) =>
        line.toLowerCase().includes(keyword.toLowerCase())
      )

      for (const line of matchingLines.slice(0, 3)) {
        const trimmed = line.trim()
        if (trimmed.length > 20 && trimmed.length < 300) {
          snippets.push({
            text: trimmed,
            relevance: 0.6,
            supportsClaim: 'uncertain',
            context: 'Keyword-based extraction fallback',
          })
        }
      }
    }

    return snippets.slice(0, 10)
  }
}

export const visionPlanner = new VisionPlanner()
