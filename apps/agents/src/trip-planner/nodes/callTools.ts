import { TripPlannerState, TripPlannerUpdate } from "../types";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { getAccommodationsListProps } from "./tools/list-accommodations/list-accommodations-module";
import { getFlightItinerariesListProps } from "./tools/list-flight-itineraries/list-flight-itineraries-module";
import { bookFlight } from "./tools/book-flight/book-flight-module";
import { tripPlannerTools } from "./tools";
import { cancelFlight } from "./tools/cancel-flight/cancel-flight-module";
import { createToolLLM } from "../../utils/llm-factory";
import { createUIComponent } from "../../utils/tool-executor";
import { safeExecute, AgentError } from "../../utils/error-handling";
import { getConfig } from "../../config";
import { logger } from "shared-libs";
import { TripDetails } from "../types";

async function handleToolCall(
  toolCall: any,
  tripDetails: TripDetails,
  config: LangGraphRunnableConfig,
  response: any
): Promise<void> {
  const toolCallId = toolCall.id ?? "";

  switch (toolCall.name) {
    case "list-accommodations":
      const accommodationProps = {
        toolCallId,
        ...getAccommodationsListProps(tripDetails),
      };
      createUIComponent(
        config,
        "accommodations-list",
        accommodationProps,
        response
      );
      logger.info("Accommodations list UI component created", {
        destination: tripDetails.destination,
      });
      break;

    case "list-flight-itineraries":
      const flightItinerariesData = getFlightItinerariesListProps(tripDetails);
      console.log("Flight itineraries data:", flightItinerariesData);

      const flightProps = {
        toolCallId,
        flights: flightItinerariesData.itineraries, // Map itineraries to flights prop
      };

      createUIComponent(
        config,
        "flight-itineraries-list",
        flightProps,
        response
      );
      logger.info("Flight itineraries list UI component created", {
        origin: tripDetails.origin,
        destination: tripDetails.destination,
        flightCount: flightItinerariesData.itineraries?.length || 0,
      });
      break;

    case "book-flight":
      const bookingParams = {
        passengerName: toolCall.args.passengerName,
        passengerEmail: toolCall.args.passengerEmail,
        itineraryId: toolCall.args.itinerary.id,
      };
      const bookingResult = await bookFlight(bookingParams);
      createUIComponent(
        config,
        "flight-booking-confirmation",
        {
          toolCallId,
          passengerName: bookingParams.passengerName,
          passengerEmail: bookingParams.passengerEmail,
          flight: bookingResult,
        },
        response
      );
      logger.info("Flight booking completed", {
        flightId: bookingResult.flightId,
        pnr: bookingResult.pnr,
      });
      break;

    case "cancel-flight":
      const cancellationResult = await cancelFlight(toolCall.args);
      createUIComponent(
        config,
        "flight-cancellation-confirmation",
        {
          toolCallId,
          flight: cancellationResult,
        },
        response
      );
      logger.info("Flight cancellation completed", {
        flightId: cancellationResult.flightId,
      });
      break;

    default:
      throw new Error(`Unknown tool: ${toolCall.name}`);
  }
}

export async function callTools(
  state: TripPlannerState,
  config: LangGraphRunnableConfig
): Promise<TripPlannerUpdate> {
  return safeExecute(
    async () => {
      if (!state.tripDetails) {
        throw new AgentError(
          "No trip details found",
          "MISSING_TRIP_DETAILS",
          false
        );
      }

      logger.info("Processing tool calls for trip planning...", {
        origin: state.tripDetails.origin,
        destination: state.tripDetails.destination,
        messageCount: state.messages.length,
      });

      const agentConfig = getConfig();
      const llm = createToolLLM(tripPlannerTools, {
        timeout: agentConfig.model.timeout,
        tags: ["tool-calling", "trip-planner"],
      });

      const response = await llm.invoke([
        {
          role: "system",
          content: `You are a trip planning agent that MUST use tools to complete user requests. You NEVER provide information or make claims without using the appropriate tools.

CRITICAL RULES:
1. You MUST call the appropriate tool for every user request
2. NEVER say things like "I'll book", "I'll send confirmation", or "I'll search" - USE THE TOOLS INSTEAD
3. NEVER provide flight info, accommodation info, or booking confirmations without calling tools
4. If user asks for flights → CALL "list-flight-itineraries" tool
5. If user wants to book → CALL "book-flight" tool (requires passengerName, passengerEmail, and itinerary)
6. If user wants to cancel → CALL "cancel-flight" tool (requires flightId or pnr)
7. If user asks for accommodations → CALL "list-accommodations" tool

AVAILABLE TOOLS:
- list-flight-itineraries: Shows available flights
- book-flight: Books a specific flight (needs passenger details)
- cancel-flight: Cancels a booked flight
- list-accommodations: Shows available accommodations

Your job is to determine which tool to call based on the user's request and call it immediately. Do not provide explanatory text - let the tool results speak for themselves.`,
        },
        ...state.messages,
      ]);

      // Process tool calls generically
      const toolCalls = response.tool_calls || [];

      if (toolCalls.length === 0) {
        throw new AgentError(
          "No valid tool calls found in response",
          "NO_TOOL_CALLS",
          true
        );
      }

      // Process each tool call
      for (const toolCall of toolCalls) {
        try {
          await handleToolCall(toolCall, state.tripDetails, config, response);
        } catch (error) {
          logger.error(`Failed to handle tool call ${toolCall.name}:`, error);
          createUIComponent(config, "error", {
            error:
              error instanceof Error ? error.message : "Tool execution failed",
            retryable: true,
            toolCallId: toolCall.id ?? "",
          });
        }
      }

      return { messages: [response] };
    },
    "call-trip-planner-tools",
    {
      retry: {
        maxRetries: 1, // Limited retries for tool calls
        retryCondition: (error) =>
          error instanceof AgentError && error.retryable,
      },
    }
  );
}
