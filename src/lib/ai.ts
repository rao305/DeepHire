import OpenAI from "openai";

/**
 * OpenRouter client configured to use OpenAI-compatible API
 * All models are accessible through this single client
 */
export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "DeepHire",
  },
});

/**
 * Model configurations for different tasks
 * Cost-optimized based on complexity requirements
 */
export const AI_MODELS = {
  // Cheapest model for simple classification tasks
  CHEAPEST: "meta-llama/llama-3.1-8b-instruct",

  // Fast, cheap, good for structured JSON output
  // NOTE: google/gemini-flash-1.5 was retired by OpenRouter; we use the
  // current Gemini 2.5 Flash family (same family as VISION) for fast tasks.
  FAST: "google/gemini-2.5-flash",

  // Better reasoning for quality writing and complex judgments
  QUALITY: "anthropic/claude-3-haiku",

  // Vision model for screenshot analysis
  VISION: "google/gemini-2.5-flash",
} as const;

export const MODELS = AI_MODELS;

/**
 * Parses AI JSON responses, handling markdown code fences
 * Gemini Flash sometimes wraps JSON in ```json blocks
 */
export function parseAIJson<T>(content: string): T {
  // Strip markdown code fences if present
  const cleaned = content
    .replace(/^```json\n?/, "")
    .replace(/^```\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonStart = cleaned.search(/[\{\[]/);
    const jsonEnd = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    const payload =
      jsonStart >= 0 && jsonEnd > jsonStart
        ? cleaned.slice(jsonStart, jsonEnd + 1)
        : cleaned;

    return JSON.parse(payload.replace(/,\s*([\}\]])/g, "$1")) as T;
  }
}

/**
 * Retry a function with exponential backoff
 * Useful for API calls that may fail transiently
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on final attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.warn(
        `Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delayMs}ms...`,
        error
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Helper to call OpenRouter with retry logic
 */
export async function callAI(params: {
  model: string;
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json_object" | "text";
}): Promise<string> {
  const {
    model,
    messages,
    maxTokens = 4096,
    temperature = 0.7,
    responseFormat = "text",
  } = params;

  try {
    const response = await openrouter.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      ...(responseFormat === "json_object" && {
        response_format: { type: "json_object" },
      }),
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenRouter API error:", error);
    throw error;
  }
}
