import { FlightItinerary } from "@/agent-uis/types";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { DetailGrid, DetailRow } from "@/components/ui/detailGrid";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

export function FlightBookingConfirmation({
  flight,
  passengerName,
  passengerEmail,
}: {
  flight: FlightItinerary;
  passengerName: string;
  passengerEmail: string;
}) {
  return (
    <Card className="min-w-md mx-auto">
      <CardHeader className="flex flex-row items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <h2 className="text-lg font-semibold">Booking Confirmed</h2>
      </CardHeader>
      <CardDescription className="px-5">
        <DetailGrid>
          <DetailRow label="Passenger:" value={passengerName} />
          <DetailRow label="Email:" value={passengerEmail} />
          <DetailRow label="Airline:" value={flight.airline} />
          <DetailRow label="From:" value={flight.from} />
          <DetailRow label="To:" value={flight.to} />
          <DetailRow
            label="Departure:"
            value={format(new Date(flight.departureTime), "MMM d, yyyy HH:mm")}
          />
          <DetailRow
            label="Arrival:"
            value={format(new Date(flight.arrivalTime), "MMM d, yyyy HH:mm")}
          />
          <DetailRow label="Duration:" value={flight.duration} />
          <DetailRow
            label="Stops:"
            value={flight.stops === 0 ? "Nonstop" : `${flight.stops} stop(s)`}
          />
          <DetailRow
            label="Total Paid:"
            value={`$${flight.price.toLocaleString()}`}
            bold
          />
        </DetailGrid>
      </CardDescription>
    </Card>
  );
}
