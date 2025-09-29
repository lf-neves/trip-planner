export interface SimulationConfig {
  enabled: boolean;
  latencyRange: {
    min: number;
    max: number;
  };
  errorRate: number; // Percentage (0-100)
}

export interface SimulationError extends Error {
  code: "BOOKING_FAILED" | "NETWORK_ERROR" | "TIMEOUT_ERROR";
  retryable: boolean;
}

const DEFAULT_CONFIG: SimulationConfig = {
  enabled: process.env.NODE_ENV === "development",
  latencyRange: {
    min: 300, // 300ms minimum latency
    max: 1200, // 1200ms maximum latency
  },
  errorRate: 15, // 15% error rate as specified
};

export function getSimulationConfig(): SimulationConfig {
  return {
    enabled:
      process.env.SIMULATION_ENABLED === "true" ||
      process.env.NODE_ENV === "development",
    latencyRange: {
      min: parseInt(process.env.SIMULATION_LATENCY_MIN || "300"),
      max: parseInt(process.env.SIMULATION_LATENCY_MAX || "1200"),
    },
    errorRate: parseFloat(process.env.SIMULATION_ERROR_RATE || "15"),
  };
}

export async function simulateLatency(
  config: SimulationConfig = DEFAULT_CONFIG
): Promise<void> {
  if (!config.enabled) return;

  const { min, max } = config.latencyRange;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;

  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function simulateFailure(
  config: SimulationConfig = DEFAULT_CONFIG
): void {
  if (!config.enabled) return;

  const shouldFail = Math.random() * 100 < config.errorRate;

  if (shouldFail) {
    const errorTypes = [
      {
        code: "BOOKING_FAILED" as const,
        message:
          "Flight booking failed due to airline system error. Please try again.",
        retryable: true,
      },
      {
        code: "NETWORK_ERROR" as const,
        message:
          "Network connection failed. Please check your connection and try again.",
        retryable: true,
      },
      {
        code: "TIMEOUT_ERROR" as const,
        message:
          "Request timed out. The airline system may be busy. Please try again.",
        retryable: true,
      },
    ];

    const randomError =
      errorTypes[Math.floor(Math.random() * errorTypes.length)];

    const error = new Error(randomError.message) as SimulationError;
    error.code = randomError.code;
    error.retryable = randomError.retryable;

    throw error;
  }
}

export async function simulateAndRandomlyFailBookingProcess(
  config?: SimulationConfig
): Promise<void> {
  const simConfig = config || getSimulationConfig();

  await simulateLatency(simConfig);
  simulateFailure(simConfig);
}
