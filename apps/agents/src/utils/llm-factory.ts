import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Tool } from "@langchain/core/tools";
import { getConfig, ModelProvider } from "../config";
import { logger } from "shared-libs";
import { AgentError, withRetry } from "./error-handling";
import assert from "node:assert";

/**
 * LLM creation options
 */
export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  provider?: ModelProvider;
  tools?: Tool[] | any[];
  toolChoice?: string | object;
  streaming?: boolean;
  tags?: string[];
}

/**
 * Factory class for creating and managing LLM instances
 */
export class LLMFactory {
  private static cache = new Map<string, BaseChatModel>();

  /**
   * Create a new LLM instance based on provider
   */
  static create(options: LLMOptions = {}): BaseChatModel {
    const config = getConfig();
    const {
      provider = config.model.provider,
      model = config.model.name,
      temperature = config.model.temperature,
      maxTokens = config.model.maxTokens,
      timeout = config.model.timeout,
      tools = [],
      toolChoice,
      streaming = false,
      tags = [],
    } = options;

    // Create cache key
    const cacheKey = `${provider}-${model}-${temperature}-${maxTokens}-${timeout}-${streaming}`;

    // Return cached instance if available
    if (this.cache.has(cacheKey) && tools.length === 0) {
      return this.cache.get(cacheKey)!;
    }

    let llm: BaseChatModel;

    try {
      switch (provider) {
        case "openai":
          llm = this.createOpenAI({
            model,
            temperature,
            maxTokens,
            timeout,
            streaming,
          });
          break;

        default:
          throw new AgentError(
            `Unsupported model provider: ${provider}`,
            "UNSUPPORTED_PROVIDER"
          );
      }

      assert(llm, "Expected LLM instance to be created.");

      // Bind tools if provided
      if (tools.length > 0) {
        const bindOptions: any = {};
        if (toolChoice) {
          bindOptions.tool_choice = toolChoice;
        }
        llm = llm.bindTools!(tools, bindOptions) as BaseChatModel;
      }

      // Add configuration tags for monitoring
      if (tags.length > 0) {
        llm = llm.withConfig({ tags }) as BaseChatModel;
      }

      // Cache the base model (without tools) for reuse
      if (tools.length === 0) {
        this.cache.set(cacheKey, llm);
      }

      logger.debug(`Created ${provider} LLM instance`, {
        model,
        temperature,
        hasTools: tools.length > 0,
        toolCount: tools.length,
      });

      return llm;
    } catch (error) {
      logger.error(`Failed to create ${provider} LLM instance:`, error);
      throw new AgentError(
        `Failed to create LLM instance: ${error}`,
        "LLM_CREATION_ERROR"
      );
    }
  }

  /**
   * Create OpenAI LLM instance
   */
  private static createOpenAI(options: {
    model: string;
    temperature: number;
    maxTokens?: number;
    timeout: number;
    streaming: boolean;
  }): ChatOpenAI {
    const { model, temperature, maxTokens, timeout, streaming } = options;

    return new ChatOpenAI({
      model,
      temperature,
      maxTokens,
      timeout,
      streaming,
      maxRetries: 0, // We handle retries at a higher level
    });
  }



  /**
   * Create LLM with automatic retry logic
   */
  static async createWithRetry(
    options: LLMOptions = {}
  ): Promise<BaseChatModel> {
    return withRetry(() => Promise.resolve(this.create(options)), {
      maxRetries: 2,
      baseDelayMs: 1000,
      retryCondition: (error) =>
        error instanceof AgentError && error.code === "LLM_CREATION_ERROR",
    });
  }

  /**
   * Create a classification LLM with common settings
   */
  static createClassificationLLM(
    options: Partial<LLMOptions> = {}
  ): BaseChatModel {
    return this.create({
      temperature: 0, // Deterministic for classification
      tags: ["classification", ...(options.tags || [])],
      ...options,
    });
  }

  /**
   * Create an extraction LLM with common settings
   */
  static createExtractionLLM(options: Partial<LLMOptions> = {}): BaseChatModel {
    return this.create({
      temperature: 0, // Deterministic for extraction
      tags: ["extraction", ...(options.tags || [])],
      ...options,
    });
  }

  /**
   * Create a tool-calling LLM with common settings
   */
  static createToolLLM(
    tools: Tool[] | any[],
    options: Partial<LLMOptions> = {}
  ): BaseChatModel {
    return this.create({
      tools,
      temperature: 0, // Deterministic for tool calling
      tags: ["tool-calling", ...(options.tags || [])],
      ...options,
    });
  }

  /**
   * Create a routing LLM with common settings
   */
  static createRoutingLLM(options: Partial<LLMOptions> = {}): BaseChatModel {
    return this.create({
      model: "gpt-4o-mini", // Use lighter model for routing
      temperature: 0, // Deterministic for routing
      tags: ["routing", "langsmith:nostream", ...(options.tags || [])],
      ...options,
    });
  }

  /**
   * Clear the LLM cache
   */
  static clearCache(): void {
    this.cache.clear();
    logger.debug("LLM cache cleared");
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Validate API keys for the configured provider
   */
  static validateApiKeys(): boolean {
    const config = getConfig();
    const provider = config.model.provider;
    
    switch (provider) {
      case "openai":
        return !!process.env.OPENAI_API_KEY;
      default:
        return false;
    }
  }
}

/**
 * Convenience function for creating LLMs with default settings
 */
export const createLLM = (options: LLMOptions = {}) =>
  LLMFactory.create(options);

/**
 * Convenience function for creating tool-enabled LLMs
 */
export const createToolLLM = (
  tools: Tool[] | any[],
  options: Partial<LLMOptions> = {}
) => LLMFactory.createToolLLM(tools, options);

/**
 * Convenience function for creating classification LLMs
 */
export const createClassificationLLM = (options: Partial<LLMOptions> = {}) =>
  LLMFactory.createClassificationLLM(options);

/**
 * Convenience function for creating extraction LLMs
 */
export const createExtractionLLM = (options: Partial<LLMOptions> = {}) =>
  LLMFactory.createExtractionLLM(options);

/**
 * Convenience function for creating routing LLMs
 */
export const createRoutingLLM = (options: Partial<LLMOptions> = {}) =>
  LLMFactory.createRoutingLLM(options);
