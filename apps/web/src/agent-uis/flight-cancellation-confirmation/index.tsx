import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { DetailGrid, DetailRow } from "@/components/ui/detailGrid";
import { Flight } from "database";
import { XCircle } from "lucide-react";

export function FlightCancellationConfirmation({ flight }: { flight: Flight }) {
  return (
    <Card className="min-w-md mx-auto ">
      <CardHeader className="flex flex-row items-center gap-3">
        <XCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-lg font-semibold text-700">Flight Cancelled</h2>
      </CardHeader>
      <CardDescription className="px-5">
        <DetailGrid>
          <DetailRow label="Passenger:" value={flight.passengerName} />
          <DetailRow label="PNR:" value={flight.pnr} />
          <DetailRow label="Status:" value={flight.status} bold />
          {/* TODO: enhance the cancellation info with the itinerary data */}
          {/* <DetailRow label="Itinerary:" value={flight.itineraryId} /> */}
          <DetailRow
            label="Price:"
            value={`$${flight.total.toLocaleString()}`}
            bold
          />
        </DetailGrid>
      </CardDescription>
    </Card>
  );
}
