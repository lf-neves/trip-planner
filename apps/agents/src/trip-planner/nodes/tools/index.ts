import { bookFlightTool } from "./book-flight/book-flight";
import { cancelFlightTool } from "./cancel-flight/cancel-flight";
import { listAccommodationsTool } from "./list-accommodations/list-accommodations";
import { listFlightItinerariesTool } from "./list-flight-itineraries/list-flight-itineraries";

export const tripPlannerTools = [
  listFlightItinerariesTool,
  listAccommodationsTool,
  bookFlightTool,
  cancelFlightTool,
];

export type { listAccommodationsSchema } from "./list-accommodations/list-accommodations";
export type { listFlightItinerariesSchema } from "./list-flight-itineraries/list-flight-itineraries";
export type { bookFlightSchema } from "./book-flight/book-flight";
export type { cancelFlightSchema } from "./cancel-flight/cancel-flight";
