import { prismaClient } from "database";
import { logger } from "shared-libs";
import { simulateAndRandomlyFailBookingProcess } from "./latency-and-failure-simulation";

type BookFlightParams = {
  passengerEmail: string;
  passengerName: string;
  itineraryId: string;
};

export async function bookFlight({
  passengerEmail,
  passengerName,
  itineraryId,
}: BookFlightParams) {
  const formattedPassengerEmail = passengerEmail.trim().toLowerCase();
  const formattedPassengerName = passengerName.trim();

  // Simulate latency and potential failures for testing UI behavior
  await simulateAndRandomlyFailBookingProcess();

  // TODO: ensure itinerary exists
  // TODO: ensure itinerary dates are in the future

  const flightBooking = await prismaClient.flight.create({
    data: {
      passengerName: formattedPassengerName,
      passengerEmail: formattedPassengerEmail,
      itineraryId: itineraryId,
      status: "TICKETED",
      pnr: `PNR${Math.floor(Math.random() * 1000000)}`,
      total: 300_00, // TODO: calculate based on itinerary
      currency: "USD",
    },
  });

  logger.info(
    "Created Flight[%s] for Itinerary[%s].",
    flightBooking.flightId,
    itineraryId
  );

  return flightBooking;
}
