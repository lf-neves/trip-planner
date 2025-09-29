import { FlightItinerary } from "@/agent-uis/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export function FlightBookingError({
  flight,
  error,
  onRetry,
  onCancel,
  isRetrying = false,
}: {
  flight: FlightItinerary;
  error: string;
  onRetry: (flight: FlightItinerary) => void;
  onCancel: () => void;
  isRetrying?: boolean;
}) {
  return (
    <Card className="w-[320px] shadow-lg border-red-200">
      <CardHeader className="flex flex-row items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <CardTitle className="text-lg text-red-800">Booking Failed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md">
          {error}
        </div>

        <div className="text-sm text-gray-600">
          <div className="font-medium mb-2">Flight Details:</div>
          <div>{flight.airline}</div>
          <div>
            {flight.from} → {flight.to}
          </div>
          <div className="font-medium">${flight.price.toLocaleString()}</div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={() => onRetry(flight)}
          variant="default"
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            "Try Again"
          )}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isRetrying}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
