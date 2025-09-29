import { z } from "zod";
import { ALL_TOOL_DESCRIPTIONS } from "../index";
import { SupervisorState, SupervisorUpdate } from "../types";
import { formatMessages } from "core";
import { createRoutingLLM } from "../../utils/llm-factory";
import { safeExecute, AgentError } from "../../utils/error-handling";
import { getConfig } from "../../config";
import { logger } from "shared-libs";

export async function router(
  state: SupervisorState
): Promise<Partial<SupervisorUpdate>> {
  return safeExecute(
    async () => {
      logger.info("Routing user query to appropriate tool...");

      const routerDescription = `The route to take based on the user's input.
${ALL_TOOL_DESCRIPTIONS}
- generalInput: handles all other cases where the above tools don't apply
`;

      const routerSchema = z.object({
        route: z.enum(["tripPlanner"]).describe(routerDescription),
      });

      const routerTool = {
        name: "router",
        description:
          "A tool to route the user's query to the appropriate tool.",
        schema: routerSchema,
      };

      const config = getConfig();
      const llm = createRoutingLLM({
        tools: [routerTool],
        toolChoice: "router",
        timeout: config.model.timeout,
        tags: ["routing", "supervisor", "langsmith:nostream"],
      });

      const prompt = `You are a friendly and intelligent travel concierge AI, dedicated to helping users plan amazing trips! 

Your role is to carefully analyze what the user is asking for and route their request to the most appropriate specialist:

Trip Planner: For anything related to travel planning, flights, accommodations, bookings, or travel advice
General Input: For general questions, greetings, or topics unrelated to travel

I always aim to understand the user's intent thoughtfully and ensure they get connected to the right specialist who can best assist them. Let me analyze their request and find the perfect match!`;

      const allMessagesButLast = state.messages.slice(0, -1);
      const lastMessage = state.messages.at(-1);

      const formattedPreviousMessages = formatMessages(allMessagesButLast);
      const formattedLastMessage = lastMessage
        ? formatMessages([lastMessage])
        : "";

      const humanMessage = `Here is the full conversation, excluding the most recent message:
  
${formattedPreviousMessages}

Here is the most recent message:

${formattedLastMessage}

Please pick the proper route based on the most recent message, in the context of the entire conversation.`;

      const response = await llm.invoke([
        { role: "system", content: prompt },
        { role: "human", content: humanMessage },
      ]);

      const routeSelection = response.tool_calls?.[0]?.args as
        | z.infer<typeof routerSchema>
        | undefined;

      if (!routeSelection) {
        throw new AgentError(
          "Could not determine route - no tool call found.",
          "ROUTING_ERROR",
          true
        );
      }

      logger.info("User query routed successfully.", {
        route: routeSelection.route,
        messageCount: state.messages.length,
      });

      return {
        next: routeSelection.route,
      };
    },
    "route-user-query",
    {
      retry: {
        maxRetries: 2,
        retryCondition: (error) =>
          error instanceof AgentError && error.retryable,
      },
    }
  );
}
