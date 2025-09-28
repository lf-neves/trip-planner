import { setupTestData } from "testing";
import { cancelFlight } from "../cancel-flight-module";
import { prismaClient } from "database";

describe("cancelFlight", () => {
  let testData: Awaited<ReturnType<typeof setupTestData>>;

  beforeEach(async () => {
    testData = await setupTestData();
  });

  test("throws an error if the provided flightId does not exist", async () => {
    await expect(
      cancelFlight({
        flightId: "non-existent-flight-id",
      })
    ).rejects.toThrow("Could not find the provided flight.");
  });

  test("cancels the flight for a given user", async () => {
    expect(testData.flight.status).toBe("TICKETED");

    // act
    await cancelFlight({
      flightId: testData.flight.flightId,
    });

    const updatedFlight = await prismaClient.flight.findUnique({
      where: { flightId: testData.flight.flightId },
    });

    // assert
    expect(updatedFlight?.status).toBe("CANCELED");
  });
});
