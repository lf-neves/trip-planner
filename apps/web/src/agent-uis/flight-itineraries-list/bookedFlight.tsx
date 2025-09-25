import { FlightItinerary } from "@/agent-uis/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailGrid, DetailRow } from "@/components/ui/detailGrid";
import { format } from "date-fns";

export function BookedFlight({ flight }: { flight: FlightItinerary }) {
  return (
    <Card className="relative w-full">
      <CardHeader>
        <CardTitle className="text-lg">Booked Flight</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailGrid>
          <DetailRow label="Airline:" value={flight.airline} />
          <DetailRow label="Route:" value={`${flight.from} → ${flight.to}`} />
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
    </Card>
  );
}
