import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarSVG } from "./starSVG";
import { capitalizeSentence } from "core";
import { format } from "date-fns";
import { X } from "lucide-react";
import { DetailGrid, DetailRow } from "@/components/ui/detailGrid";
import type { Accommodation, TripDetails } from "../../../../agents/src/types";

export function SelectedAccommodation({
  accommodation,
  onHide,
  tripDetails,
  onBook,
}: {
  accommodation: Accommodation;
  onHide: () => void;
  tripDetails: TripDetails;
  onBook: (accommodation: Accommodation) => void;
}) {
  const startDate = new Date(tripDetails.startDate);
  const endDate = new Date(tripDetails.endDate);

  const totalTripDurationDays = Math.max(
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
    1,
  );

  const totalPrice = totalTripDurationDays * accommodation.price;

  return (
    <Card className="w-full flex gap-6 overflow-hidden shadow-lg">
      <CardContent className="px-4 flex flex-col">
        <CardHeader className="flex flex-col gap-3 px-0 mb-4">
          <div className="relative rounded-md overflow-hidden bg-gray-200">
            <img
              src={accommodation.image}
              alt={accommodation.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onHide}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md text-gray-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardTitle className="text-xl font-semibold">
          {accommodation.name}
        </CardTitle>

        <div className="mt-5 flex-1 space-y-4">
          <DetailGrid>
            <DetailRow
              label={
                <span className="flex items-center gap-1">
                  <StarSVG fill="black" />
                  {accommodation.rating}
                </span>
              }
              value={
                <p className="text-gray-600">
                  {capitalizeSentence(accommodation.city)}
                </p>
              }
            />
            <DetailRow
              label="Check-in"
              value={format(startDate, "MMM d, yyyy")}
            />
            <DetailRow
              label="Check-out"
              value={format(endDate, "MMM d, yyyy")}
            />
            <DetailRow label="Guests" value={tripDetails.numberOfGuests} />
            <DetailRow
              label="Total Price"
              value={`$${totalPrice.toLocaleString()}`}
              bold
            />
          </DetailGrid>
        </div>

        <CardFooter className="px-0">
          <Button
            onClick={() => onBook(accommodation)}
            variant="secondary"
            className="w-full bg-gray-800 text-white hover:bg-gray-900"
          >
            Book
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
