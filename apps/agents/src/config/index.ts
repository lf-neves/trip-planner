import { z } from "zod";
import { logger } from "shared-libs";

/**
 * Model provider configuration
 */
export const ModelProviderSchema = z.enum(["openai", "anthropic"]);
export type ModelProvider = z.infer<typeof ModelProviderSchema>;

/**
 * Model configuration schema
 */
export const ModelConfigSchema = z.object({
  provider: ModelProviderSchema.default("openai"),
  name: z.string().default("gpt-4o"),
  temperature: z.number().min(0).max(2).default(0),
  maxTokens: z.number().optional(),
  timeout: z.number().default(30000), // 30 seconds
});

/**
 * Simulation configuration schema
 */
export const SimulationConfigSchema = z.object({
  enabled: z.boolean().default(false),
  latencyRange: z.object({
    min: z.number().min(0).default(300),
    max: z.number().min(0).default(1200),
  }),
  errorRate: z.number().min(0).max(100).default(15),
});

/**
 * Database configuration schema
 */
export const DatabaseConfigSchema = z.object({
  timeout: z.number().default(10000), // 10 seconds
  retries: z.number().min(0).max(10).default(3),
  poolSize: z.number().optional(),
});

/**
 * Retry configuration schema
 */
export const RetryConfigSchema = z.object({
  maxRetries: z.number().min(0).max(10).default(3),
  baseDelayMs: z.number().min(0).default(1000),
  maxDelayMs: z.number().min(0).default(10000),
  exponentialBackoff: z.boolean().default(true),
});

/**
 * Circuit breaker configuration schema
 */
export const CircuitBreakerConfigSchema = z.object({
  failureThreshold: z.number().min(1).default(5),
  timeoutMs: z.number().min(1000).default(60000),
  monitoringPeriodMs: z.number().min(1000).default(10000),
});

/**
 * Logging configuration schema
 */
export const LoggingConfigSchema = z.object({
  level: z.enum(["error", "warn", "info", "debug"]).default("info"),
  enableRequestLogging: z.boolean().default(true),
  enablePerformanceLogging: z.boolean().default(true),
});

/**
 * Main agent configuration schema
 */
export const AgentConfigSchema = z.object({
  model: ModelConfigSchema,
  simulation: SimulationConfigSchema,
  database: DatabaseConfigSchema,
  retry: RetryConfigSchema,
  circuitBreaker: CircuitBreakerConfigSchema,
  logging: LoggingConfigSchema,
  environment: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

/**
 * Environment variable mapping
 */
const getEnvironmentConfig = (): Partial<AgentConfig> => {
  return {
    model: {
      provider: (process.env.MODEL_PROVIDER as ModelProvider) || "openai",
      name: process.env.MODEL_NAME || "gpt-4o",
      temperature: parseFloat(process.env.MODEL_TEMPERATURE || "0"),
      maxTokens: process.env.MODEL_MAX_TOKENS
        ? parseInt(process.env.MODEL_MAX_TOKENS)
        : undefined,
      timeout: parseInt(process.env.MODEL_TIMEOUT || "30000"),
    },
    simulation: {
      enabled: process.env.SIMULATION_ENABLED === "true",
      latencyRange: {
        min: parseInt(process.env.SIMULATION_LATENCY_MIN || "300"),
        max: parseInt(process.env.SIMULATION_LATENCY_MAX || "1200"),
      },
      errorRate: parseFloat(process.env.SIMULATION_ERROR_RATE || "15"),
    },
    database: {
      timeout: parseInt(process.env.DATABASE_TIMEOUT || "10000"),
      retries: parseInt(process.env.DATABASE_RETRIES || "3"),
      poolSize: process.env.DATABASE_POOL_SIZE
        ? parseInt(process.env.DATABASE_POOL_SIZE)
        : undefined,
    },
    retry: {
      maxRetries: parseInt(process.env.RETRY_MAX_ATTEMPTS || "3"),
      baseDelayMs: parseInt(process.env.RETRY_BASE_DELAY || "1000"),
      maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY || "10000"),
      exponentialBackoff: process.env.RETRY_EXPONENTIAL_BACKOFF !== "false",
    },
    circuitBreaker: {
      failureThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || "5"
      ),
      timeoutMs: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || "60000"),
      monitoringPeriodMs: parseInt(
        process.env.CIRCUIT_BREAKER_MONITORING_PERIOD || "10000"
      ),
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || "info",
      enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== "false",
      enablePerformanceLogging:
        process.env.ENABLE_PERFORMANCE_LOGGING !== "false",
    },
    environment: (process.env.NODE_ENV as any) || "development",
  };
};

/**
 * Cached configuration instance
 */
let cachedConfig: AgentConfig | null = null;

/**
 * Get the validated agent configuration
 */
export const getConfig = (): AgentConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const envConfig = getEnvironmentConfig();
    const config = AgentConfigSchema.parse(envConfig);

    cachedConfig = config;

    logger.info("Agent configuration loaded successfully", {
      environment: config.environment,
      modelProvider: config.model.provider,
      modelName: config.model.name,
      simulationEnabled: config.simulation.enabled,
    });

    return config;
  } catch (error) {
    logger.error("Failed to parse agent configuration:", error);
    throw new Error(
      "Invalid agent configuration. Please check your environment variables."
    );
  }
};

/**
 * Validate configuration without caching
 */
export const validateConfig = (config: unknown): AgentConfig => {
  return AgentConfigSchema.parse(config);
};

/**
 * Reset the cached configuration (useful for testing)
 */
export const resetConfig = (): void => {
  cachedConfig = null;
};

/**
 * Get configuration for a specific model based on provider
 */
export const getModelConfig = (provider?: ModelProvider) => {
  const config = getConfig();
  const targetProvider = provider || config.model.provider;

  return {
    ...config.model,
    provider: targetProvider,
  };
};

/**
 * Configuration validation errors
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public validationErrors?: z.ZodError
  ) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * Environment-specific configuration overrides
 */
export const getEnvironmentDefaults = (env: string) => {
  switch (env) {
    case "test":
      return {
        model: { temperature: 0, timeout: 5000 },
        simulation: { enabled: false },
        logging: { level: "error" as const },
        retry: { maxRetries: 1 },
      };
    case "production":
      return {
        model: { temperature: 0.1, timeout: 60000 },
        simulation: { enabled: false },
        logging: { level: "warn" as const },
        retry: { maxRetries: 5 },
        circuitBreaker: { failureThreshold: 3 },
      };
    default:
      return {};
  }
};
