import { logger } from "shared-libs";

/**
 * Custom error class for agent-specific errors with retry capabilities
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AgentError";
  }

  static from(error: unknown, code?: string): AgentError {
    if (error instanceof AgentError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    return new AgentError(message, code || "UNKNOWN_ERROR", false);
  }
}

/**
 * Specific error types for different scenarios
 */
export class LLMError extends AgentError {
  constructor(message: string, retryable = true) {
    super(message, "LLM_ERROR", retryable);
  }
}

export class ValidationError extends AgentError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", false);
  }
}

export class ToolExecutionError extends AgentError {
  constructor(message: string, toolName: string, retryable = false) {
    super(`Tool ${toolName}: ${message}`, "TOOL_EXECUTION_ERROR", retryable);
  }
}

export class DatabaseError extends AgentError {
  constructor(message: string, retryable = true) {
    super(message, "DATABASE_ERROR", retryable);
  }
}

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBackoff: boolean;
  retryCondition?: (error: Error) => boolean;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  exponentialBackoff: true,
  retryCondition: (error) => error instanceof AgentError && error.retryable,
};

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.info(`Retry attempt ${attempt}/${config.maxRetries}`);
      }
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === config.maxRetries || !config.retryCondition!(lastError)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = config.exponentialBackoff
        ? Math.min(config.baseDelayMs * Math.pow(2, attempt), config.maxDelayMs)
        : config.baseDelayMs;

      logger.warn(
        `Operation failed (attempt ${attempt + 1}/${config.maxRetries + 1}): ${lastError.message}. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Timeout wrapper for promises
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out"
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new AgentError(errorMessage, "TIMEOUT_ERROR", true)),
      timeoutMs
    );
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Circuit breaker for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private failureThreshold: number = 5,
    private timeoutMs: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.timeoutMs) {
        this.state = "HALF_OPEN";
      } else {
        throw new AgentError(
          "Circuit breaker is OPEN",
          "CIRCUIT_BREAKER_OPEN",
          false
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      logger.error(`Circuit breaker opened after ${this.failures} failures`);
    }
  }

  getState() {
    return this.state;
  }
}

/**
 * Error boundary for wrapping operations with consistent error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  context: string,
  options: {
    retry?: Partial<RetryOptions>;
    timeout?: number;
    fallback?: () => T | Promise<T>;
  } = {}
): Promise<T> {
  try {
    const { retry, timeout } = options;

    let promise = retry ? withRetry(operation, retry) : operation();

    if (timeout) {
      promise = withTimeout(
        promise,
        timeout,
        `${context} timed out after ${timeout}ms`
      );
    }

    return await promise;
  } catch (error) {
    logger.error(`Error in ${context}:`, error);

    if (options.fallback) {
      logger.info(`Using fallback for ${context}`);
      return await options.fallback();
    }

    throw AgentError.from(error, `${context.toUpperCase()}_ERROR`);
  }
}
