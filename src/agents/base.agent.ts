import { openrouter, AI_MODELS, parseAIJson, callAI } from '@/lib/ai';
import type { AgentResult } from '@/types';

export abstract class BaseAgent<T = any> {
  protected ai = openrouter;
  protected models = AI_MODELS;

  constructor() {
    // OpenRouter client is pre-configured in @/lib/ai
  }

  abstract execute(...args: any[]): Promise<AgentResult<T>>;

  /**
   * Call AI with specified model (defaults to fast model)
   * Uses OpenRouter for all models
   */
  protected async callAI(
    prompt: string,
    systemPrompt?: string,
    model: string = AI_MODELS.FAST,
    options?: {
      maxTokens?: number;
      temperature?: number;
      responseFormat?: 'json_object' | 'text';
    }
  ): Promise<string> {
    const messages: any[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    return callAI({
      model,
      messages,
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      responseFormat: options?.responseFormat,
    });
  }

  /**
   * Legacy alias for backward compatibility
   * @deprecated Use callAI instead
   */
  protected async callClaude(
    prompt: string,
    systemPrompt?: string,
    model?: string
  ): Promise<string> {
    return this.callAI(prompt, systemPrompt, model || AI_MODELS.QUALITY);
  }

  /**
   * Legacy alias for backward compatibility
   * @deprecated Use callAI instead
   */
  protected async callGPT(
    prompt: string,
    systemPrompt?: string,
    model?: string
  ): Promise<string> {
    return this.callAI(prompt, systemPrompt, model || AI_MODELS.FAST);
  }

  protected parseJsonResponse<T>(response: string): T | null {
    try {
      return parseAIJson<T>(response);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return null;
    }
  }

  protected extractListFromResponse(response: string): string[] {
    const lines = response.split('\n');
    return lines
      .filter(line => line.trim().match(/^[-*\d.]/))
      .map(line => line.replace(/^[-*\d.]\s*/, '').trim())
      .filter(Boolean);
  }
}
