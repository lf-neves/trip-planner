import { z } from "zod";

export const bookFlightSchema = z
  .object({
    itinerary: z
      .object({
        id: z.string(),
        airline: z.string(),
        from: z.string(),
        to: z.string(),
        departureTime: z.string(),
        arrivalTime: z.string(),
        duration: z.string(),
        stops: z.number(),
        price: z.number(),
      })
      .describe("The flight itinerary to book"),
    passengerName: z.string().describe("The name of the passenger"),
    passengerEmail: z
      .string()
      .describe("The email of the passenger")
      .email("Invalid email address"),
  })
  .describe("A tool to book a flight for the user");

export const bookFlightTool = {
  name: "book-flight",
  description: "A tool to book a flight for the user",
  schema: bookFlightSchema,
};
