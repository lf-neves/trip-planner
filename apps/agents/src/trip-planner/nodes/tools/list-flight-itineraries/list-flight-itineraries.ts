import { z } from "zod";

export const listFlightItinerariesSchema = z
  .object({})
  .describe("A tool to list flight itineraries for the user");

export const listFlightItinerariesTool = {
  name: "list-flight-itineraries",
  description: "A tool to list flight itineraries for the user",
  schema: listFlightItinerariesSchema,
};
