import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { DetailGrid, DetailRow } from "@/components/ui/detailGrid";
import { Flight } from "database";
import { CheckCircle } from "lucide-react";

export function FlightBookingConfirmation({
  flight,
  passengerName,
  passengerEmail,
}: {
  flight: Flight;
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
          <DetailRow label="PNR:" value={flight.pnr} />
          <DetailRow
            label="Total Paid:"
            value={`$${(flight.total / 100).toFixed(2).toLocaleString()}`}
            bold
          />
        </DetailGrid>
      </CardDescription>
    </Card>
  );
}
