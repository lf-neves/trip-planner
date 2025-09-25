import { FlightItinerary } from "@/agent-uis/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DetailGrid, DetailRow } from "@/components/ui/detailGrid";
import { format } from "date-fns";
import { X } from "lucide-react";

export function SelectedFlight({
  flight,
  onHide,
  onBook,
}: {
  flight: FlightItinerary;
  onHide: () => void;
  onBook: (flight: FlightItinerary) => void;
}) {
  return (
    <Card className="w-[320px] shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">{flight.airline}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onHide}
          className="cursor-pointer hover:bg-gray-50 text-gray-500 w-6 h-6"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <DetailGrid>
          <DetailRow label="From:" value={flight.from} />
          <DetailRow label="To:" value={flight.to} />
          <DetailRow
            label="Departure:"
            value={format(new Date(flight.departureTime), "MMM d, HH:mm")}
          />
          <DetailRow
            label="Arrival:"
            value={format(new Date(flight.arrivalTime), "MMM d, HH:mm")}
          />
          <DetailRow label="Duration:" value={flight.duration} />
          <DetailRow
            label="Stops:"
            value={flight.stops === 0 ? "Nonstop" : `${flight.stops} stop(s)`}
          />
          <DetailRow
            label="Price:"
            value={`$${flight.price.toLocaleString()}`}
            bold
          />
        </DetailGrid>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onBook(flight)}
          variant="secondary"
          className="w-full bg-gray-800 text-white hover:bg-gray-900"
        >
          Book
        </Button>
      </CardFooter>
    </Card>
  );
}
