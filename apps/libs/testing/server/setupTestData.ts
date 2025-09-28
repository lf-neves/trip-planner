import { faker } from "shared-libs";
import { Flight, prismaClient } from "database";

export async function setupTestData({
  flightOverrides,
}: {
  flightOverrides?: Partial<Flight>;
} = {}) {
  const flight = await prismaClient.flight.create({
    data: {
      pnr: faker.string.alphanumeric(6).toUpperCase(),
      passengerEmail: faker.internet.email(),
      passengerName: faker.person.fullName(),
      status: "TICKETED",
      total: faker.number.int({ min: 100, max: 2000 }),
      currency: "USD",
      itineraryId: faker.string.uuid(),
      ...flightOverrides,
    },
  });

  return { flight };
}
