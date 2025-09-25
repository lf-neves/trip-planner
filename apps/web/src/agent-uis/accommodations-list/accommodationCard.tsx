import { Card, CardContent } from "@/components/ui/card";
import { StarSVG } from "./starSVG";
import { capitalizeSentence } from "core";
import type { Accommodation } from "../../../../agents/src/types";

export function AccommodationCard({
  accommodation,
}: {
  accommodation: Accommodation;
}) {
  return (
    <Card
      className="relative w-[161px] h-[256px] overflow-hidden shadow-md"
      style={{
        backgroundImage: `url(${accommodation.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <CardContent className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 p-3 text-white bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-sm font-semibold">{accommodation.name}</p>
        <div className="flex items-center gap-1 text-xs">
          <p className="flex items-center justify-center">
            <StarSVG />
            {accommodation.rating}
          </p>
          <p>·</p>
          <p>{accommodation.price}</p>
        </div>
        <p className="text-sm">{capitalizeSentence(accommodation.city)}</p>
      </CardContent>
    </Card>
  );
}
