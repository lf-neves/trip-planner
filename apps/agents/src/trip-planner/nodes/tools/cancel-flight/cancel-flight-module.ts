import { prismaClient } from "database";
import { logger } from "shared-libs";

export async function cancelFlight({
  flightId,
  pnr,
}: {
  flightId?: string;
  pnr?: string;
}) {
  if (!flightId && !pnr) {
    throw new Error(
      "You must provide either a flightId or a pnr to cancel a flight."
    );
  }

  const flight = await prismaClient.flight.findUnique({
    where: { flightId, pnr, status: "TICKETED" },
  });

  if (!flight) {
    throw new Error("Could not find the provided flight.");
  }

  const canceledFlight = await prismaClient.flight.update({
    where: { flightId },
    data: { status: "CANCELED" },
  });

  logger.info("Canceled Flight[%s].", canceledFlight.flightId);

  return canceledFlight;
}
