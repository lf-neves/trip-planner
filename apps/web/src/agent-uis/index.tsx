import AccommodationsList from "./accommodations-list";
import { FlightBookingConfirmation } from "./flight-booking-confirmation";
import { FlightCancellationConfirmation } from "./flight-cancellation-confirmation";
import FlightItinerariesList from "./flight-itineraries-list";

const componentMap = {
  "accommodations-list": AccommodationsList,
  "flight-itineraries-list": FlightItinerariesList,
  "flight-booking-confirmation": FlightBookingConfirmation,
  "flight-cancellation-confirmation": FlightCancellationConfirmation,
} as const;

export default componentMap;
