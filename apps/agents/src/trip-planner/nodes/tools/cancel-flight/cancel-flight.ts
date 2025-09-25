import { z } from "zod";

export const cancelFlightSchema = z
  .object({
    flightId: z.string().describe("The ID of the flight to cancel"),
  })
  .describe("A tool to cancel a booked flight");

export const cancelFlightTool = {
  name: "cancel-flight",
  description: "A tool to cancel a booked flight",
  schema: cancelFlightSchema,
};
