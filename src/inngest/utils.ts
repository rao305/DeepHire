/**
 * Inngest Utility Functions
 * Helpers for logging, error handling, and cost estimation
 */

/**
 * Cost estimation constants (USD)
 * Based on Claude and Vision API pricing
 */
const COST_PER_VISION_CALL = 0.003; // ~$3 per 1000 calls
const COST_PER_1K_TOKENS = 0.015; // Claude Sonnet pricing
const AVERAGE_TOKENS_PER_CALL = 2000; // Estimated average

/**
 * Creates a logger that prefixes all logs with the step name
 * Useful for debugging multi-step Inngest functions
 *
 * @param stepName - Name of the current step
 * @returns Logger object with info, warn, and error methods
 *
 * @example
 * const logger = createStepLogger('github-verification');
 * logger.info('Starting verification', { url: 'https://github.com/user' });
 */
export function createStepLogger(stepName: string) {
  const prefix = `[${stepName}]`;

  return {
    info: (message: string, data?: Record<string, any>) => {
      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    },

    warn: (message: string, data?: Record<string, any>) => {
      if (data) {
        console.warn(`${prefix} ${message}`, data);
      } else {
        console.warn(`${prefix} ${message}`);
      }
    },

    error: (message: string, error?: Error | unknown, data?: Record<string, any>) => {
      if (error instanceof Error) {
        console.error(`${prefix} ${message}`, {
          error: error.message,
          stack: error.stack,
          ...data,
        });
      } else if (error) {
        console.error(`${prefix} ${message}`, { error, ...data });
      } else {
        console.error(`${prefix} ${message}`, data);
      }
    },
  };
}

/**
 * Formats and logs errors with context for Inngest functions
 * Provides structured error information for debugging and monitoring
 *
 * @param error - The error that occurred
 * @param context - Additional context about where/when the error occurred
 * @returns Formatted error object suitable for logging or returning
 *
 * @example
 * try {
 *   await verifyGitHub(url);
 * } catch (error) {
 *   const formattedError = handleAgentError(error as Error, {
 *     agent: 'github',
 *     candidateId: '123',
 *     claimId: 'claim-456'
 *   });
 *   throw formattedError;
 * }
 */
export function handleAgentError(
  error: Error,
  context: Record<string, any>
): {
  message: string;
  originalError: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: string;
} {
  const formattedError = {
    message: `Agent error: ${error.message}`,
    originalError: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error('Agent Error:', formattedError);

  return formattedError;
}

/**
 * Estimates the cost of an agent run in USD
 * Helps track and optimize agent execution costs
 *
 * @param visionCalls - Number of vision API calls made
 * @param textTokens - Number of text tokens processed
 * @returns Estimated cost in USD
 *
 * @example
 * const cost = estimateCost(5, 10000);
 * console.log(`Estimated cost: $${cost.toFixed(4)}`);
 */
export function estimateCost(visionCalls: number, textTokens: number): number {
  const visionCost = visionCalls * COST_PER_VISION_CALL;
  const textCost = (textTokens / 1000) * COST_PER_1K_TOKENS;
  return visionCost + textCost;
}

/**
 * Estimates cost based on execution steps
 * Simplified version when exact token counts aren't available
 *
 * @param steps - Number of execution steps taken
 * @param visionCalls - Number of vision API calls made
 * @returns Estimated cost in USD
 */
export function estimateCostFromSteps(steps: number, visionCalls: number): number {
  const estimatedTokens = steps * AVERAGE_TOKENS_PER_CALL;
  return estimateCost(visionCalls, estimatedTokens);
}

/**
 * Creates a timeout promise for race conditions
 * Useful for implementing agent budget limits
 *
 * @param ms - Timeout in milliseconds
 * @param errorMessage - Error message to throw on timeout
 * @returns Promise that rejects after timeout
 *
 * @example
 * await Promise.race([
 *   agentTask(),
 *   createTimeout(30000, 'Agent exceeded 30s budget')
 * ]);
 */
export function createTimeout(ms: number, errorMessage: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
}

/**
 * Safely stringifies objects for logging
 * Handles circular references and errors
 *
 * @param obj - Object to stringify
 * @param maxDepth - Maximum nesting depth
 * @returns JSON string or error message
 */
export function safeStringify(obj: any, maxDepth: number = 3): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      },
      2
    );
  } catch (error) {
    return `[Stringify Error: ${error instanceof Error ? error.message : 'Unknown'}]`;
  }
}

/**
 * Calculates progress percentage for agent execution
 *
 * @param currentStep - Current step number
 * @param maxSteps - Maximum steps in budget
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentStep: number, maxSteps: number): number {
  return Math.min(Math.round((currentStep / maxSteps) * 100), 100);
}

/**
 * Formats duration in milliseconds to human-readable string
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(65000) // "1m 5s"
 * formatDuration(1500) // "1.5s"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
