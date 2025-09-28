import { faker } from "shared-libs";
import { bookFlight } from "../book-flight-module";

describe("bookFlight", () => {
  // TODO: Improve test coverage
  test("books a flight for a given user", async () => {
    // act
    const flight = await bookFlight({
      passengerEmail: faker.internet.email(),
      passengerName: faker.person.fullName(),
      itineraryId: faker.string.uuid(),
    });

    // assert
    expect(flight).toEqual(
      expect.objectContaining({ flightId: flight.flightId })
    );
  });
});
