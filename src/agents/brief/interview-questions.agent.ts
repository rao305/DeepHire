import { openrouter, MODELS, parseAIJson, retryWithBackoff } from "@/lib/ai"
import type {
  WeakClaim,
  ExtractedClaim,
  JobRubric,
  InterviewQuestion,
} from "@/types"
import type { RankedShippedWork } from "@/agents/evidence/shipped-work-ranker.agent"

export class InterviewQuestionsAgent {
  /**
   * Generates targeted interview questions based on weak claims, unverified claims,
   * shipped work, and job rubric requirements.
   */
  async generateQuestions(
    weakClaims: WeakClaim[],
    unverifiedClaims: ExtractedClaim[],
    shippedWork: RankedShippedWork[],
    jobRubric: JobRubric
  ): Promise<InterviewQuestion[]> {
    return retryWithBackoff(async () => {
      const prompt = this.buildQuestionsPrompt(
        weakClaims,
        unverifiedClaims,
        shippedWork,
        jobRubric
      )

      const response = await openrouter.chat.completions.create({
        model: MODELS.FAST, // "google/gemini-flash-1.5"
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response from AI")
      }

      const parsed = parseAIJson<{ questions: InterviewQuestion[] }>(content)
      return parsed.questions
    })
  }

  /**
   * Generates a single skill probe question for a specific skill and claim.
   */
  async generateSkillProbe(
    skill: string,
    claimText: string
  ): Promise<InterviewQuestion> {
    return retryWithBackoff(async () => {
      const prompt = `Generate a single, targeted interview question to probe this skill claim:

Skill: ${skill}
Claim: ${claimText}

The question should:
- Be open-ended and require detailed technical explanation
- Probe for depth of understanding and hands-on experience
- Include 2-3 follow-up probes to dig deeper

Return JSON:
{
  "question": "main question text",
  "relatedClaim": "${claimText}",
  "purpose": "what you're trying to verify",
  "followUpProbes": ["probe 1", "probe 2", "probe 3"]
}`

      const response = await openrouter.chat.completions.create({
        model: MODELS.FAST,
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error("No response from AI")
      }

      return parseAIJson<InterviewQuestion>(content)
    })
  }

  /**
   * Categorizes questions into technical, behavioral, and clarification categories.
   */
  categorizeQuestions(questions: InterviewQuestion[]): {
    technical: InterviewQuestion[]
    behavioral: InterviewQuestion[]
    clarification: InterviewQuestion[]
  } {
    const technical: InterviewQuestion[] = []
    const behavioral: InterviewQuestion[] = []
    const clarification: InterviewQuestion[] = []

    for (const question of questions) {
      const text = question.question.toLowerCase()
      const purpose = question.purpose.toLowerCase()

      // Technical: asks about implementation, architecture, debugging, tools
      if (
        text.includes("how did you") ||
        text.includes("how would you") ||
        text.includes("explain") ||
        text.includes("implement") ||
        text.includes("design") ||
        text.includes("debug") ||
        text.includes("optimize") ||
        purpose.includes("technical") ||
        purpose.includes("implementation") ||
        purpose.includes("architecture")
      ) {
        technical.push(question)
        continue
      }

      // Behavioral: asks about process, collaboration, decision-making
      if (
        text.includes("tell me about") ||
        text.includes("describe a time") ||
        text.includes("walk me through") ||
        text.includes("your role") ||
        text.includes("your team") ||
        purpose.includes("collaboration") ||
        purpose.includes("leadership") ||
        purpose.includes("process")
      ) {
        behavioral.push(question)
        continue
      }

      // Default to clarification
      clarification.push(question)
    }

    return { technical, behavioral, clarification }
  }

  private buildQuestionsPrompt(
    weakClaims: WeakClaim[],
    unverifiedClaims: ExtractedClaim[],
    shippedWork: RankedShippedWork[],
    jobRubric: JobRubric
  ): string {
    return `You are an expert technical interviewer. Generate 5-8 targeted interview questions for a candidate.

## Context

### Weak Claims (need verification)
${weakClaims.slice(0, 5).map((wc, i) => `${i + 1}. ${wc.claimText} — ${wc.reason}`).join("\n")}

### Unverified Claims
${unverifiedClaims.slice(0, 5).map((uc, i) => `${i + 1}. ${uc.text}`).join("\n")}

### Top Shipped Work
${shippedWork.slice(0, 3).map((sw, i) => `${i + 1}. ${sw.title}: ${sw.description} (relevance: ${sw.roleRelevanceScore.toFixed(2)})`).join("\n")}

### Must-Have Skills from Job Rubric
${jobRubric.mustHaveSkills.join(", ")}

### Nice-to-Have Skills
${jobRubric.niceToHaveSkills.join(", ")}

## Question Requirements

Generate 5-8 questions with this distribution:
- 2-3 questions on the most important unverified or weak claims
- 2 questions that go deeper on the best shipped work items
- 1-2 questions on must-have skills where evidence was thin or missing
- 1 question on scale/complexity if scale claims were made

Each question must:
1. Be open-ended and require detailed explanation
2. Probe for specific technical depth or behavioral detail
3. Include the related claim being verified
4. State the purpose clearly
5. Include 2-3 follow-up probes to dig deeper

## Output Format

Return JSON:
{
  "questions": [
    {
      "question": "main question text",
      "relatedClaim": "the claim this verifies",
      "purpose": "what you're trying to verify",
      "followUpProbes": ["probe 1", "probe 2", "probe 3"]
    }
  ]
}

Make questions concrete and specific to the candidate's experience.`
  }
}

export const interviewQuestionsAgent = new InterviewQuestionsAgent()
