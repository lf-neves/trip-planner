import { capitalizeSentence } from "core";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StarSVG } from "./starSVG";
import { format } from "shared-libs";

//TODO: Improve type sharing between apps
import type { Accommodation, TripDetails } from "../../../../agents/src/types";

export function BookedAccommodation({
  accommodation,
  tripDetails,
}: {
  accommodation: Accommodation;
  tripDetails: TripDetails;
}) {
  const startDate = new Date(tripDetails.startDate);
  const endDate = new Date(tripDetails.endDate);
  const totalTripDurationDays = Math.max(
    endDate.getDate() - startDate.getDate(),
    1,
  );
  const totalPrice = totalTripDurationDays * accommodation.price;

  return (
    <Card
      className="w-full h-[400px] shadow-md py-0"
      style={{
        backgroundImage: `url(${accommodation.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <CardContent className="h-full flex flex-col gap-2 p-6 text-white bg-gradient-to-t from-transparent to-black/100 via-black/70 rounded-md">
        <CardTitle className="text-lg font-medium">
          Booked Accommodation
        </CardTitle>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <span className="font-medium">Address:</span>
          <span>
            {accommodation.name}, {capitalizeSentence(accommodation.city)}
          </span>

          <span className="font-medium">Rating:</span>
          <span className="flex items-center gap-1">
            <StarSVG />
            {accommodation.rating}
          </span>

          <span className="font-medium">Dates:</span>
          <span>
            {format(startDate, "MMM d, yyyy")} -{" "}
            {format(endDate, "MMM d, yyyy")}
          </span>

          <span className="font-medium">Guests:</span>
          <span>{tripDetails.numberOfGuests}</span>

          <span className="font-semibold">Total Price:</span>
          <span className="font-semibold">${totalPrice.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
