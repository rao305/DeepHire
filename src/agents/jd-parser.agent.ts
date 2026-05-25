import { openrouter, AI_MODELS, parseAIJson, retryWithBackoff } from '@/lib/ai';
import { JobRubric } from '@/types';

/**
 * Job Description parsing agent
 * Extracts structured rubric from job description text
 */
export class JDParserAgent {
  /**
   * Parse a job description and extract a structured JobRubric
   * @param jdText - Raw job description text
   * @returns Structured JobRubric with skills, weights, and metadata
   */
  async parseJobDescription(jdText: string): Promise<JobRubric> {
    const systemPrompt = `You are an expert at analyzing job descriptions and extracting technical requirements.

Extract and return a JSON object with the following structure:
{
  "title": "job title as stated",
  "seniority": "junior|mid|senior|staff|principal",
  "mustHaveSkills": ["array of required technical skills - languages, frameworks, tools, cloud platforms"],
  "niceToHaveSkills": ["array of preferred/bonus skills"],
  "focusAreas": ["array of technical focus areas like frontend, backend, fullstack, infrastructure, ML, mobile, etc."],
  "domainExpertise": ["array of domain expertise like fintech, e-commerce, healthcare, etc."],
  "weights": {
    "technical_depth": 0.0-1.0,
    "shipped_work": 0.0-1.0,
    "leadership": 0.0-1.0,
    "scale_experience": 0.0-1.0
  }
}

Guidelines:
- Extract ALL must-have technical skills mentioned
- Identify skills from requirements, responsibilities, and qualifications sections
- Set weights based on JD emphasis (must sum to 1.0):
  * technical_depth: algorithmic complexity, system design, architecture
  * shipped_work: production experience, deployment, real-world projects
  * leadership: team lead, mentoring, technical direction
  * scale_experience: high-traffic systems, distributed systems, performance
- Infer seniority from years of experience, responsibilities, and complexity
- Return ONLY valid JSON`;

    const userPrompt = `Analyze this job description and extract the structured rubric:

${jdText}

Return valid JSON matching the schema.`;

    const response = await retryWithBackoff(async () => {
      const completion = await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || '';
    });

    const rawRubric = parseAIJson<any>(response);
    return this.validateAndNormalizeRubric(rawRubric);
  }

  /**
   * Quick extraction of must-have skills for pre-filtering
   * @param jdText - Raw job description text
   * @returns Array of required technical skills
   */
  async extractMustHaveSkills(jdText: string): Promise<string[]> {
    const systemPrompt = `You are a technical recruiter. Extract ONLY the must-have/required technical skills from a job description.

Return a JSON object with:
{
  "skills": ["array of required skills"]
}

Include:
- Programming languages
- Frameworks and libraries
- Tools and platforms
- Cloud providers
- Databases

Exclude:
- Soft skills
- Nice-to-have skills
- Years of experience`;

    const userPrompt = `Extract required technical skills from this job description:

${jdText}

Return valid JSON.`;

    const response = await retryWithBackoff(async () => {
      const completion = await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
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

    const result = parseAIJson<{ skills: string[] }>(response);
    return this.normalizeSkills(result.skills || []);
  }

  /**
   * Detect seniority level from job description
   * @param jdText - Raw job description text
   * @returns Seniority level
   */
  async detectSeniorityLevel(
    jdText: string
  ): Promise<'junior' | 'mid' | 'senior' | 'staff' | 'principal'> {
    const systemPrompt = `You are an expert at determining seniority levels from job descriptions.

Analyze the job description and return a JSON object with:
{
  "seniority": "junior|mid|senior|staff|principal",
  "reasoning": "brief explanation"
}

Guidelines:
- junior: 0-2 years, entry-level, learning focus
- mid: 2-5 years, independent contributor, moderate complexity
- senior: 5-8 years, technical leadership, high complexity, mentoring
- staff: 8+ years, cross-team impact, architecture, technical strategy
- principal: 10+ years, org-level impact, vision, expert authority

Consider:
- Years of experience mentioned
- Complexity of responsibilities
- Leadership and mentoring expectations
- Scope of impact (team vs org)
- System design and architecture depth`;

    const userPrompt = `Determine the seniority level for this job description:

${jdText}

Return valid JSON.`;

    const response = await retryWithBackoff(async () => {
      const completion = await openrouter.chat.completions.create({
        model: AI_MODELS.FAST,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || '';
    });

    const result = parseAIJson<{
      seniority: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
    }>(response);
    return result.seniority || 'mid';
  }

  /**
   * Validate and normalize a raw rubric from AI
   * @param raw - Raw rubric object from AI
   * @returns Validated and normalized JobRubric
   */
  private validateAndNormalizeRubric(raw: any): JobRubric {
    // Provide defaults
    const rubric: JobRubric = {
      title: raw.title || 'Software Engineer',
      seniority: raw.seniority || 'mid',
      mustHaveSkills: this.normalizeSkills(raw.mustHaveSkills || []),
      niceToHaveSkills: this.normalizeSkills(raw.niceToHaveSkills || []),
      focusAreas: raw.focusAreas || ['fullstack'],
      domainExpertise: raw.domainExpertise || [],
      weights: {
        technical_depth: 0.25,
        shipped_work: 0.25,
        leadership: 0.25,
        scale_experience: 0.25,
      },
    };

    // Normalize weights if provided
    if (raw.weights) {
      const weights = raw.weights;
      let total =
        (weights.technical_depth || 0) +
        (weights.shipped_work || 0) +
        (weights.leadership || 0) +
        (weights.scale_experience || 0);

      // If weights don't sum to 1.0, normalize them
      if (Math.abs(total - 1.0) > 0.01) {
        if (total === 0) {
          // All weights are 0, use defaults
          total = 1.0;
        } else {
          rubric.weights = {
            technical_depth: (weights.technical_depth || 0) / total,
            shipped_work: (weights.shipped_work || 0) / total,
            leadership: (weights.leadership || 0) / total,
            scale_experience: (weights.scale_experience || 0) / total,
          };
        }
      } else {
        rubric.weights = {
          technical_depth: weights.technical_depth || 0,
          shipped_work: weights.shipped_work || 0,
          leadership: weights.leadership || 0,
          scale_experience: weights.scale_experience || 0,
        };
      }
    }

    // Ensure weights sum to exactly 1.0 (fix floating point errors)
    const finalTotal = Object.values(rubric.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(finalTotal - 1.0) > 0.001) {
      const factor = 1.0 / finalTotal;
      rubric.weights = {
        technical_depth: rubric.weights.technical_depth * factor,
        shipped_work: rubric.weights.shipped_work * factor,
        leadership: rubric.weights.leadership * factor,
        scale_experience: rubric.weights.scale_experience * factor,
      };
    }

    return rubric;
  }

  /**
   * Normalize skill names for consistency
   * @param skills - Array of skill names
   * @returns Normalized skill names
   */
  private normalizeSkills(skills: string[]): string[] {
    const normalizations: Record<string, string> = {
      // JavaScript ecosystem
      'react.js': 'React',
      reactjs: 'React',
      'react js': 'React',
      'next.js': 'Next.js',
      nextjs: 'Next.js',
      'vue.js': 'Vue.js',
      vuejs: 'Vue.js',
      'node.js': 'Node.js',
      nodejs: 'Node.js',
      'express.js': 'Express',
      expressjs: 'Express',

      // TypeScript
      ts: 'TypeScript',
      typescript: 'TypeScript',

      // Python
      py: 'Python',
      python3: 'Python',

      // Databases
      postgresql: 'PostgreSQL',
      postgres: 'PostgreSQL',
      mongodb: 'MongoDB',
      mongo: 'MongoDB',
      mysql: 'MySQL',
      redis: 'Redis',

      // Cloud
      aws: 'AWS',
      'amazon web services': 'AWS',
      gcp: 'Google Cloud',
      'google cloud platform': 'Google Cloud',
      azure: 'Azure',
      'microsoft azure': 'Azure',

      // DevOps
      k8s: 'Kubernetes',
      kubernetes: 'Kubernetes',
      docker: 'Docker',

      // Other
      git: 'Git',
      github: 'GitHub',
      gitlab: 'GitLab',
    };

    return skills
      .map((skill) => {
        const lower = skill.toLowerCase().trim();
        return normalizations[lower] || skill.trim();
      })
      .filter((skill) => skill.length > 0);
  }
}

/**
 * Singleton instance of JDParserAgent
 */
export const jdParserAgent = new JDParserAgent();
