import { TripPlannerState, TripPlannerUpdate } from "../types";
import { z } from "zod";
import { formatMessages } from "core";
import { logger } from "shared-libs";
import { createClassificationLLM } from "../../utils/llm-factory";
import { safeExecute, AgentError } from "../../utils/error-handling";
import { getConfig } from "../../config";

export async function classify(
  state: TripPlannerState
): Promise<TripPlannerUpdate> {
  return safeExecute(
    async () => {
      logger.info("Classifying trip details relevance...");

      if (!state.tripDetails) {
        // Can not classify if tripDetails are undefined
        return {};
      }

      const schema = z.object({
        isRelevant: z
          .boolean()
          .describe(
            "Whether the trip details are still relevant to the user's request."
          ),
      });

      const config = getConfig();
      const model = createClassificationLLM({
        tools: [
          {
            name: "classify",
            description:
              "A tool to classify whether or not the trip details are still relevant to the user's request.",
            schema,
          },
        ],
        toolChoice: "classify",
        timeout: config.model.timeout,
        tags: ["classify", "trip-relevance"],
      });

      const prompt = `I'm your thoughtful travel planning assistant! 🎯

I have these wonderful trip details already saved for you:
 From: ${state.tripDetails.origin} → To: ${state.tripDetails.destination}
 Dates: ${state.tripDetails.startDate} to ${state.tripDetails.endDate}
 Travelers: ${state.tripDetails.numberOfGuests} guest(s)

Now I need to check if your latest message is still about this same trip, or if you're asking about something different.

I'll mark the trip details as "still relevant" if you're:
- Asking about flights, accommodations, or activities for this same trip
- Making changes or asking questions about the current trip
- Continuing our conversation about this journey

I'll mark them as "no longer relevant" if you're:
- Planning a completely different trip (new destination, dates, or travelers)
- Asking about something unrelated to travel
- Starting fresh with new travel plans

Let me carefully review your latest message in the context of our conversation...`;

      const humanMessage = `Here is the entire conversation so far:\n${formatMessages(state.messages)}`;

      const response = await model.invoke(
        [
          { role: "system", content: prompt },
          { role: "human", content: humanMessage },
        ],
        { tags: ["langsmith:nostream"] }
      );

      const classificationDetails = response.tool_calls?.[0]?.args as
        | z.infer<typeof schema>
        | undefined;

      if (!classificationDetails) {
        throw new AgentError(
          "Could not classify trip details - no tool call found.",
          "CLASSIFICATION_ERROR",
          true
        );
      }

      logger.info("Trip details classification completed.", {
        isRelevant: classificationDetails.isRelevant,
        origin: state.tripDetails.origin,
        destination: state.tripDetails.destination,
      });

      if (!classificationDetails.isRelevant) {
        return {
          tripDetails: undefined,
        };
      }

      // If it is relevant, return the state unchanged
      return {};
    },
    "classify-trip-details",
    {
      retry: {
        maxRetries: 2,
        retryCondition: (error) =>
          error instanceof AgentError && error.retryable,
      },
    }
  );
}
