import { ToolMessage } from "@langchain/langgraph-sdk";
import { typedUi } from "@langchain/langgraph-sdk/react-ui/server";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { logger } from "shared-libs";
import { DO_NOT_RENDER_ID_PREFIX } from "core";
import { AgentError, ToolExecutionError, safeExecute } from "./error-handling";
import { getConfig } from "../config";

export interface ToolExecutionContext {
  config: LangGraphRunnableConfig;
  state: any;
  toolCall: {
    id?: string;
    name: string;
    args: any;
  };
}

export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: Error;
  messages?: ToolMessage[];
  uiComponents?: Array<{
    name: string;
    props: any;
  }>;
}

export interface ToolExecutionOptions {
  timeout?: number;
  retries?: number;
  skipValidation?: boolean;
  fallbackComponent?: string;
  errorComponent?: string;
}

export type ToolHandler<TArgs = any, TResult = any> = (
  args: TArgs,
  context: ToolExecutionContext
) => Promise<TResult>;

export class ToolExecutor {
  private static handlers = new Map<
    string,
    {
      handler: ToolHandler;
      schema?: z.ZodSchema;
      options?: ToolExecutionOptions;
    }
  >();

  static register<TArgs, TResult>(
    toolName: string,
    handler: ToolHandler<TArgs, TResult>,
    schema?: z.ZodSchema<TArgs>,
    options?: ToolExecutionOptions
  ): void {
    this.handlers.set(toolName, {
      handler: handler as ToolHandler,
      schema,
      options,
    });

    logger.debug(`Registered tool handler: ${toolName}`);
  }

  static async execute(
    context: ToolExecutionContext,
    options: ToolExecutionOptions = {}
  ): Promise<ToolExecutionResult> {
    const { toolCall } = context;
    const toolName = toolCall.name;
    const config = getConfig();

    logger.info(`Executing tool: ${toolName}`, {
      toolId: toolCall.id,
      args: toolCall.args,
    });

    // Get registered handler
    const handlerInfo = this.handlers.get(toolName);
    if (!handlerInfo) {
      const error = new ToolExecutionError(
        `No handler registered for tool: ${toolName}`,
        toolName
      );
      return this.handleError(error, context, options);
    }

    const { handler, schema, options: handlerOptions } = handlerInfo;
    const mergedOptions = { ...handlerOptions, ...options };

    try {
      // Validate arguments if schema is provided
      let validatedArgs = toolCall.args;
      if (schema && !mergedOptions.skipValidation) {
        const validation = schema.safeParse(toolCall.args);
        if (!validation.success) {
          throw new ToolExecutionError(
            `Invalid arguments for tool ${toolName}: ${validation.error.message}`,
            toolName
          );
        }
        validatedArgs = validation.data;
      }

      // Execute tool with timeout and retries
      const result = await safeExecute(
        () => handler(validatedArgs, context),
        `tool-${toolName}`,
        {
          timeout: mergedOptions.timeout || config.database.timeout,
          retry: {
            maxRetries: mergedOptions.retries || config.retry.maxRetries,
            baseDelayMs: config.retry.baseDelayMs,
            retryCondition: (error) => {
              return error instanceof AgentError && error.retryable;
            },
          },
        }
      );

      logger.info(`Tool ${toolName} executed successfully`, {
        toolId: toolCall.id,
        resultType: typeof result,
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      logger.error(`Tool ${toolName} execution failed:`, error);
      return this.handleError(error as Error, context, mergedOptions);
    }
  }

  static async executeMany(
    contexts: ToolExecutionContext[],
    options: ToolExecutionOptions = {}
  ): Promise<ToolExecutionResult[]> {
    const promises = contexts.map((context) => this.execute(context, options));
    return Promise.all(promises);
  }

  private static handleError(
    error: Error,
    context: ToolExecutionContext,
    options: ToolExecutionOptions
  ): ToolExecutionResult {
    const { toolCall } = context;
    const isRetryable = error instanceof AgentError && error.retryable;

    // Create error message
    const errorMessage: ToolMessage = {
      type: "tool",
      id: `${DO_NOT_RENDER_ID_PREFIX}${uuidv4()}`,
      tool_call_id: toolCall.id || uuidv4(),
      content: `Tool execution failed: ${error.message}`,
    };

    // Determine UI component to show
    const componentName = options.errorComponent || "error";
    const uiComponent = {
      name: componentName,
      props: {
        error: error.message,
        retryable: isRetryable,
        toolName: toolCall.name,
        toolId: toolCall.id,
        timestamp: new Date().toISOString(),
      },
    };

    return {
      success: false,
      error,
      messages: [errorMessage],
      uiComponents: [uiComponent],
    };
  }

  static pushUI(
    config: LangGraphRunnableConfig,
    componentName: string,
    props: any,
    message?: any
  ): void {
    try {
      const ui = typedUi(config);
      const componentProps = {
        ...props,
      };

      if (message) {
        ui.push({ name: componentName, props: componentProps }, { message });
      } else {
        ui.push({ name: componentName, props: componentProps });
      }

      logger.debug(`Pushed UI component: ${componentName}`, componentProps);
    } catch (error) {
      logger.error(`Failed to push UI component ${componentName}:`, error);
      // Don't throw here to avoid breaking the tool execution flow
    }
  }

  static createToolMessage(
    toolCallId: string,
    content: string,
    visible: boolean = true
  ): ToolMessage {
    return {
      type: "tool",
      id: visible ? uuidv4() : `${DO_NOT_RENDER_ID_PREFIX}${uuidv4()}`,
      tool_call_id: toolCallId,
      content,
    };
  }

  static getRegisteredTools(): string[] {
    return Array.from(this.handlers.keys());
  }

  static isRegistered(toolName: string): boolean {
    return this.handlers.has(toolName);
  }

  static unregister(toolName: string): boolean {
    const success = this.handlers.delete(toolName);
    if (success) {
      logger.debug(`Unregistered tool handler: ${toolName}`);
    }
    return success;
  }

  static clear(): void {
    this.handlers.clear();
    logger.debug("Cleared all tool handlers");
  }

  static getStats(): {
    totalHandlers: number;
    handlers: Array<{
      name: string;
      hasSchema: boolean;
      hasOptions: boolean;
    }>;
  } {
    const handlers = Array.from(this.handlers.entries()).map(
      ([name, info]) => ({
        name,
        hasSchema: !!info.schema,
        hasOptions: !!info.options,
      })
    );

    return {
      totalHandlers: this.handlers.size,
      handlers,
    };
  }
}

export function registerTool<TArgs>(
  toolName: string,
  schema?: z.ZodSchema<TArgs>,
  options?: ToolExecutionOptions
) {
  return function (
    _target: any,
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const handler = descriptor.value as ToolHandler<TArgs>;
    ToolExecutor.register(toolName, handler, schema, options);
    return descriptor;
  };
}

export async function executeSimpleTool<TArgs, TResult>(
  toolName: string,
  args: TArgs,
  context: Partial<ToolExecutionContext>,
  options?: ToolExecutionOptions
): Promise<TResult> {
  const fullContext: ToolExecutionContext = {
    config: context.config!,
    state: context.state || {},
    toolCall: {
      id: uuidv4(),
      name: toolName,
      args,
    },
  };

  const result = await ToolExecutor.execute(fullContext, options);

  if (!result.success) {
    throw (
      result.error ||
      new ToolExecutionError(`Tool ${toolName} failed`, toolName)
    );
  }

  return result.result;
}

export function createUIComponent(
  config: LangGraphRunnableConfig,
  componentName: string,
  props: any,
  message?: any,
  fallback?: () => void
): void {
  try {
    ToolExecutor.pushUI(config, componentName, props, message);
  } catch (error) {
    logger.warn(
      `Failed to create UI component ${componentName}, using fallback`
    );
    if (fallback) {
      fallback();
    }
  }
}
