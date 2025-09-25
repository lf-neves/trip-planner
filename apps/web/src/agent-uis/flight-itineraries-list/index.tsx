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

export default function FlightItinerariesList({
  toolCallId,
  flights,
}: {
  toolCallId: string;
  flights: FlightItinerary[];
}) {
  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();

  const [selectedFlight, setSelectedFlight] = useState<
    FlightItinerary | undefined
  >();

  const [flightBooked, setFlightBooked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || flightBooked) return;
    const toolResponse = getToolResponse(toolCallId, thread);
    if (toolResponse) {
      setFlightBooked(true);

      try {
        const parsedContent: { flight: FlightItinerary } = JSON.parse(
          toolResponse.content as string
        );
        setSelectedFlight(parsedContent.flight);
      } catch {
        console.error("Failed to parse tool response content.");
      }
    }
  }, [flightBooked, thread, toolCallId]);

  function handleBookFlight(flight: FlightItinerary) {
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
      }
    );

    setFlightBooked(true);
    if (selectedFlight?.id !== flight.id) {
      setSelectedFlight(flight);
    }
  }

  if (flightBooked && selectedFlight) {
    return <BookedFlight flight={selectedFlight} />;
  } else if (flightBooked) {
    return <div>Successfully booked flight!</div>;
  }

  if (selectedFlight) {
    return (
      <SelectedFlight
        flight={selectedFlight}
        onHide={() => setSelectedFlight(undefined)}
        onBook={handleBookFlight}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
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
