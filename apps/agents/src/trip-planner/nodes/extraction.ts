import { v4 as uuidv4 } from "uuid";
import { TripDetails, TripPlannerState, TripPlannerUpdate } from "../types";
import { z } from "zod";
import { ToolMessage } from "@langchain/langgraph-sdk";
import { formatMessages } from "core";
import { DO_NOT_RENDER_ID_PREFIX } from "core";
import { createExtractionLLM } from "../../utils/llm-factory";
import { safeExecute, ValidationError } from "../../utils/error-handling";
import { getConfig } from "../../config";
import { logger } from "shared-libs";

function calculateDates(
  startDate: string | undefined,
  endDate: string | undefined
): { startDate: Date; endDate: Date } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (!startDate && !endDate) {
    // Both undefined: 4 and 5 weeks in future
    const start = new Date(now);
    start.setDate(start.getDate() + 28); // 4 weeks
    const end = new Date(now);
    end.setDate(end.getDate() + 35); // 5 weeks
    return { startDate: start, endDate: end };
  }

  if (startDate && !endDate) {
    // Only start defined: end is 1 week after
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new ValidationError(`Invalid start date format: ${startDate}`);
    }
    if (start < tomorrow) {
      throw new ValidationError("Start date must be in the future");
    }
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { startDate: start, endDate: end };
  }

  if (!startDate && endDate) {
    // Only end defined: start is 1 week before
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      throw new ValidationError(`Invalid end date format: ${endDate}`);
    }
    if (end < tomorrow) {
      throw new ValidationError("End date must be in the future");
    }
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { startDate: start, endDate: end };
  }

  // Both defined: use as is with validation
  const start = new Date(startDate!);
  const end = new Date(endDate!);

  if (isNaN(start.getTime())) {
    throw new ValidationError(`Invalid start date format: ${startDate}`);
  }
  if (isNaN(end.getTime())) {
    throw new ValidationError(`Invalid end date format: ${endDate}`);
  }
  if (start < tomorrow) {
    throw new ValidationError("Start date must be in the future");
  }
  if (end <= start) {
    throw new ValidationError("End date must be after start date");
  }

  return { startDate: start, endDate: end };
}

export async function extraction(
  state: TripPlannerState
): Promise<TripPlannerUpdate> {
  return safeExecute(
    async () => {
      logger.info("Starting trip details extraction...");

      const schema = z.object({
        passengerFullName: z
          .string()
          .min(2, "Name must be at least 2 characters")
          .max(100, "Name too long")
          .regex(
            /^[a-zA-Z\s\-']+$/,
            "Name can only contain letters, spaces, hyphens, and apostrophes"
          )
          .describe("The full name of the passenger"),
        passengerEmail: z
          .string()
          .email("Invalid email address")
          .transform((email) => email.trim().toLowerCase())
          .describe("The email of the passenger"),
        origin: z
          .string()
          .min(2, "Origin must be specified")
          .transform((loc) => loc.trim())
          .describe(
            "The origin location to plan the trip from. Can be a city, state, or country."
          ),
        destination: z
          .string()
          .min(2, "Destination must be specified")
          .transform((loc) => loc.trim())
          .describe(
            "The destination location to plan the trip to. Can be a city, state, or country."
          ),
        startDate: z
          .string()
          .optional()
          .describe(
            "The start date of the trip. Should be in YYYY-MM-DD format"
          ),
        endDate: z
          .string()
          .optional()
          .describe("The end date of the trip. Should be in YYYY-MM-DD format"),
        numberOfGuests: z
          .number()
          .min(1, "Number of guests must be at least 1")
          .max(10, "Number of guests cannot exceed 10")
          .describe(
            "The number of guests for the trip. Should default to 2 if not specified"
          ),
      });

      const config = getConfig();
      const model = createExtractionLLM({
        tools: [
          {
            name: "extract",
            description: "A tool to extract information from a user's request.",
            schema: schema,
          },
        ],
        timeout: config.model.timeout,
        tags: ["extract", "trip-details"],
      });

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.toLocaleString("default", {
        month: "long",
      });
      const currentDay = currentDate.getDate();

      const prompt = `Hello! I'm your dedicated trip planning assistant, and I'm excited to help you plan an amazing journey! ✨

IMPORTANT CONTEXT: Today is ${currentMonth} ${currentDay}, ${currentYear}. When interpreting dates, always use the current year ${currentYear} unless the user explicitly specifies a different year. For example, if a user says "December 25", interpret this as "December 25, ${currentYear}" not any past year.

To get started, I'd love to gather some key details about your trip. Here's what would be most helpful:

👤 **Your Details**:
   - Your full name (for any bookings)
   - Your email address (for confirmations and updates)

🌍 **Trip Information**:
   - Where you'd like to go (destination)
   - Where you're traveling from (I'll assume New York if not specified)
   - When you'd like to travel (start and end dates - optional for now)
   - How many travelers will be going (I'll assume 1 if not mentioned)

**Date Guidelines**:
- Always interpret dates in the context of ${currentYear} unless explicitly told otherwise
- If a user says a month/day without a year, assume they mean ${currentYear}
- Dates should be in YYYY-MM-DD format (e.g., ${currentYear}-12-25 for December 25th)

I'm looking through our conversation to see what you've already shared. If I'm missing any essential information (like your destination, name, or email), I'll politely ask for those details.

Don't worry if you haven't mentioned everything yet - I only need the basics to get started, and we can fill in the rest as we go!

Let me review what you've told me so far...
`;

      const humanMessage = `Here is the entire conversation so far:\n${formatMessages(state.messages)}`;

      const response = await model.invoke([
        { role: "system", content: prompt },
        { role: "human", content: humanMessage },
      ]);

      const toolCall = response.tool_calls?.[0];
      if (!toolCall) {
        logger.info("No tool call found, returning clarification message");
        return {
          messages: [response],
        };
      }

      const extractedDetails = toolCall.args as z.infer<typeof schema>;

      const { startDate, endDate } = calculateDates(
        extractedDetails.startDate,
        extractedDetails.endDate
      );

      const extractionDetailsWithDefaults: TripDetails = {
        startDate,
        endDate,
        numberOfGuests:
          extractedDetails.numberOfGuests && extractedDetails.numberOfGuests > 0
            ? extractedDetails.numberOfGuests
            : 2,
        destination: extractedDetails.destination,
        origin: extractedDetails.origin,
      };

      const extractToolResponse: ToolMessage = {
        type: "tool",
        id: `${DO_NOT_RENDER_ID_PREFIX}${uuidv4()}`,
        tool_call_id: toolCall.id ?? "",
        content: "Successfully extracted trip details",
      };

      logger.info("Trip details extracted successfully", {
        origin: extractionDetailsWithDefaults.origin,
        destination: extractionDetailsWithDefaults.destination,
        startDate: extractionDetailsWithDefaults.startDate.toISOString(),
        endDate: extractionDetailsWithDefaults.endDate.toISOString(),
        numberOfGuests: extractionDetailsWithDefaults.numberOfGuests,
      });

      return {
        tripDetails: extractionDetailsWithDefaults,
        messages: [response, extractToolResponse],
      };
    },
    "extract-trip-details",
    {
      retry: {
        maxRetries: 2,
        retryCondition: (error) => !(error instanceof ValidationError),
      },
    }
  );
}
