import { v4 as uuidv4 } from "uuid";
import {
  useStreamContext,
  type UIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Message } from "@langchain/langgraph-sdk";
import { getToolResponse } from "../utils/get-tool-response";
import { DO_NOT_RENDER_ID_PREFIX } from "core";
import { BookedAccommodation } from "./bookedAccommodation";
import { SelectedAccommodation } from "./selectedAccommodation";
import { AccommodationCard } from "./accommodationCard";
import type { Accommodation, TripDetails } from "../../../../agents/src/types";

export default function AccommodationsList({
  toolCallId,
  tripDetails,
  accommodations,
}: {
  toolCallId: string;
  tripDetails: TripDetails;
  accommodations: Accommodation[];
}) {
  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();

  const [selectedAccommodation, setSelectedAccommodation] = useState<
    Accommodation | undefined
  >();
  const [accommodationBooked, setAccommodationBooked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || accommodationBooked) return;
    const toolResponse = getToolResponse(toolCallId, thread);
    if (toolResponse) {
      setAccommodationBooked(true);
      try {
        const parsedContent: {
          accommodation: Accommodation;
          tripDetails: TripDetails;
        } = JSON.parse(toolResponse.content as string);
        setSelectedAccommodation(parsedContent.accommodation);
      } catch {
        console.error("Failed to parse tool response content.");
      }
    }
  }, []);

  function handleBookAccommodation(accommodation: Accommodation) {
    const orderDetails = {
      accommodation,
      tripDetails,
    };

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
                name: "book-accommodation",
                content: JSON.stringify(orderDetails),
              },
              {
                type: "human",
                content: `Booked ${accommodation.name} for ${tripDetails.numberOfGuests}.`,
              },
            ],
          },
          goto: "generalInput",
        },
      },
    );

    setAccommodationBooked(true);
    if (selectedAccommodation?.id !== accommodation.id) {
      setSelectedAccommodation(accommodation);
    }
  }

  if (accommodationBooked && selectedAccommodation) {
    return (
      <BookedAccommodation
        tripDetails={tripDetails}
        accommodation={selectedAccommodation}
      />
    );
  } else if (accommodationBooked) {
    return <div>Successfully booked accommodation!</div>;
  }

  if (selectedAccommodation) {
    return (
      <SelectedAccommodation
        tripDetails={tripDetails}
        onHide={() => setSelectedAccommodation(undefined)}
        accommodation={selectedAccommodation}
        onBook={handleBookAccommodation}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full sm:max-w-sm md:max-w-3xl lg:max-w-3xl"
      >
        <CarouselContent>
          {accommodations.map((accommodation) => (
            <CarouselItem
              key={accommodation.id}
              className="basis-1/2 md:basis-1/4"
              onClick={() => setSelectedAccommodation(accommodation)}
            >
              <AccommodationCard accommodation={accommodation} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
