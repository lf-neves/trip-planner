import { FlightItinerary } from "@/agent-uis/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "shared-libs";
import { Plane } from "lucide-react";

export function FlightCard({ flight }: { flight: FlightItinerary }) {
  return (
    <Card className="w-[300px] h-[180px] cursor-pointer hover:shadow-lg transition">
      <CardHeader className="flex-row items-center gap-2">
        <Plane className="w-5 h-5 text-gray-500" />
        <CardTitle className="text-sm">{flight.airline}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">
            {format(new Date(flight.departureTime), "HH:mm")}
          </p>
          <p className="text-xs text-gray-500">{flight.from}</p>
        </div>
        <div className="text-center text-xs text-gray-600">
          <p>{flight.duration}</p>
          <p>{flight.stops === 0 ? "Nonstop" : `${flight.stops} stop(s)`}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">
            {format(new Date(flight.arrivalTime), "HH:mm")}
          </p>
          <p className="text-xs text-gray-500">{flight.to}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <p className="text-base font-bold text-gray-800">
          ${flight.price.toLocaleString()}
        </p>
      </CardFooter>
    </Card>
  );
}
