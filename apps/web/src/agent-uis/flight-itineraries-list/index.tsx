import { v4 as uuidv4 } from "uuid";
import {
  useStreamContext,
  type UIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useEffect, useState } from "react";
import { Message } from "@langchain/langgraph-sdk";
import { getToolResponse } from "../utils/get-tool-response";
import { DO_NOT_RENDER_ID_PREFIX } from "core";
import { FlightItinerary } from "@/agent-uis/types";
import { SelectedFlight } from "./selectedFlight";
import { FlightCard } from "./flightCard";
import { BookedFlight } from "./bookedFlight";
import { FlightBookingSkeleton } from "./flightBookingSkeleton";
import { FlightBookingError } from "./flightBookingError";

type BookingState = "idle" | "booking" | "success" | "error";

export default function FlightItinerariesList({
  toolCallId,
  flights,
  error,
}: {
  toolCallId: string;
  flights: FlightItinerary[];
  error?: string;
}) {
  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();

  const [selectedFlight, setSelectedFlight] = useState<
    FlightItinerary | undefined
  >();

  const [bookingState, setBookingState] = useState<BookingState>(
    error ? "error" : "idle",
  );
  const [bookingError, setBookingError] = useState<string>(error || "");

  // Set the selected flight if there's an immediate error and only one flight
  useEffect(() => {
    if (error && flights.length === 1 && !selectedFlight) {
      setSelectedFlight(flights[0]);
    }
  }, [error, flights, selectedFlight]);

  useEffect(() => {
    if (typeof window === "undefined" || bookingState !== "booking") return;

    const toolResponse = getToolResponse(toolCallId, thread);
    if (toolResponse) {
      try {
        const parsedContent: { flight: FlightItinerary; error?: string } =
          JSON.parse(toolResponse.content as string);

        if (parsedContent.error) {
          setBookingState("error");
          setBookingError(parsedContent.error);
        } else {
          setBookingState("success");
          setSelectedFlight(parsedContent.flight);
        }
      } catch {
        setBookingState("error");
        setBookingError(
          "Failed to process booking response. Please try again.",
        );
      }
    }
  }, [bookingState, thread, toolCallId]);

  function handleBookFlight(flight: FlightItinerary) {
    setBookingState("booking");
    setBookingError("");

    thread.submit(
      {},
      {
        command: {
          update: {
            messages: [
              {
                type: "tool",
                tool_call_id: toolCallId,
                id: `${DO_NOT_RENDER_ID_PREFIX}${uuidv4()}`,
                name: "book-flight",
                content: JSON.stringify({ itinerary: flight }),
              },
            ],
          },
          goto: "generalInput",
        },
      },
    );

    if (selectedFlight?.id !== flight.id) {
      setSelectedFlight(flight);
    }
  }

  function handleRetryBooking(flight: FlightItinerary) {
    handleBookFlight(flight);
  }

  function handleCancelBooking() {
    setBookingState("idle");
    setBookingError("");
    setSelectedFlight(undefined);
  }

  // Show success state
  if (bookingState === "success" && selectedFlight) {
    return <BookedFlight flight={selectedFlight} />;
  }

  // Show booking in progress with skeleton
  if (bookingState === "booking") {
    return <FlightBookingSkeleton />;
  }

  // Show error state with retry option
  if (bookingState === "error" && selectedFlight) {
    return (
      <FlightBookingError
        flight={selectedFlight}
        error={bookingError}
        onRetry={handleRetryBooking}
        onCancel={handleCancelBooking}
        isRetrying={false}
      />
    );
  }

  // Show selected flight details
  if (selectedFlight && bookingState === "idle") {
    return (
      <SelectedFlight
        flight={selectedFlight}
        onHide={() => setSelectedFlight(undefined)}
        onBook={handleBookFlight}
      />
    );
  }

  // Show flight list
  return (
    <div className="flex flex-wrap gap-4" data-testid="flight-itineraries-list">
      {flights.map((flight) => (
        <div
          key={flight.id}
          onClick={() => setSelectedFlight(flight)}
          className="cursor-pointer"
        >
          <FlightCard flight={flight} />
        </div>
      ))}
    </div>
  );
}
