import { TripPlannerState, TripPlannerUpdate } from "../types";
import { ChatOpenAI } from "@langchain/openai";
import { typedUi } from "@langchain/langgraph-sdk/react-ui/server";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { findToolCall } from "../../find-tool-call";
import { getAccommodationsListProps } from "./tools/list-accommodations/list-accommodations-module";
import { getFlightItinerariesListProps } from "./tools/list-flight-itineraries/list-flight-itineraries-module";
import { bookFlight } from "./tools/book-flight/book-flight-module";
import {
  type bookFlightSchema,
  cancelFlightSchema,
  type listAccommodationsSchema,
  type listFlightItinerariesSchema,
  tripPlannerTools,
} from "./tools";
import { cancelFlight } from "./tools/cancel-flight/cancel-flight-module";

export async function callTools(
  state: TripPlannerState,
  config: LangGraphRunnableConfig
): Promise<TripPlannerUpdate> {
  if (!state.tripDetails) {
    throw new Error("No trip details found");
  }

  const ui = typedUi(config);

  const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 }).bindTools(
    tripPlannerTools
  );

  const response = await llm.invoke([
    {
      role: "system",
      content: `
      You are an AI travel assistant.
      
      When the user wants to book a flight, you MUST call the "book-flight" tool.
      The tool requires:
        - itinerary (the flight itinerary to book)
        - passengerName
        - passengerEmail
      Do NOT respond with text only, call the tool. If you don't have all the required information, ask the user for the missing details.

      When the user wants to cancel a flight, you MUST call the "cancel-flight" tool.
      The tool requires flightId (the ID of the flight to cancel) or pnr (the booking reference).
      Do NOT respond with text only, call the tool. If you don't have the flightId or pnr, ask the user for it.

      When the user wants to see flight options, you MUST call the "list-flight-itineraries" tool.
      Do NOT respond with text only, call the tool.

      When the user wants to see accommodation options, you MUST call the "list-accommodations" tool.
      Do NOT respond with text only, call the tool.

      Always use the tools when relevant.
    `,
    },
    ...state.messages,
  ]);

  const listAccommodationsToolCall = response.tool_calls?.find(
    findToolCall("list-accommodations")<typeof listAccommodationsSchema>
  );

  const listFlightItinerariesToolCall = response.tool_calls?.find(
    findToolCall("list-flight-itineraries")<typeof listFlightItinerariesSchema>
  );

  const bookFlightToolCall = response.tool_calls?.find(
    findToolCall("book-flight")<typeof bookFlightSchema>
  );

  const cancelFlightToolCall = response.tool_calls?.find(
    findToolCall("cancel-flight")<typeof cancelFlightSchema>
  );

  if (
    !listAccommodationsToolCall &&
    !listFlightItinerariesToolCall &&
    !bookFlightToolCall &&
    !cancelFlightToolCall
  ) {
    throw new Error("No tool calls found.");
  }

  if (listAccommodationsToolCall) {
    ui.push(
      {
        name: "accommodations-list",
        props: {
          toolCallId: listAccommodationsToolCall.id ?? "",
          ...getAccommodationsListProps(state.tripDetails),
        },
      },
      { message: response }
    );
  }

  if (listFlightItinerariesToolCall) {
    ui.push(
      {
        name: "flight-itineraries-list",
        props: {
          toolCallId: listFlightItinerariesToolCall.id ?? "",
          flights: getFlightItinerariesListProps(state.tripDetails).itineraries,
        },
      },
      { message: response }
    );
  }

  if (bookFlightToolCall) {
    const bookedFlight = await bookFlight({
      itineraryId: bookFlightToolCall.args.itinerary.id,
      passengerName: bookFlightToolCall.args.passengerName,
      passengerEmail: bookFlightToolCall.args.passengerEmail,
    });

    ui.push(
      {
        name: "flight-booking-confirmation",
        props: {
          passengerEmail: bookedFlight.passengerEmail,
          passengerName: bookedFlight.passengerName,
          flight: bookFlightToolCall.args.itinerary,
        },
      },
      { message: response }
    );
  }

  if (cancelFlightToolCall) {
    const canceledFlight = await cancelFlight({
      flightId: cancelFlightToolCall.args.flightId,
    });

    ui.push(
      {
        name: "flight-cancellation-confirmation",
        props: {
          flight: canceledFlight,
        },
      },
      { message: response }
    );
  }

  return {
    messages: [response],
    ui: ui.items,
    timestamp: Date.now(),
  };
}
