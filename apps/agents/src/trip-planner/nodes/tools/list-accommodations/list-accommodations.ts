import { z } from "zod";

export const listAccommodationsSchema = z
  .object({})
  .describe("A tool to list accommodations for the user");

export const listAccommodationsTool = {
  name: "list-accommodations",
  description: "A tool to list accommodations for the user",
  schema: listAccommodationsSchema,
};
