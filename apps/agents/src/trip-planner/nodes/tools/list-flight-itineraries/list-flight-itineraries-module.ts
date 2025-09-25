import { faker } from "shared-libs";
import { TripDetails } from "src/trip-planner/types";

export type FlightItinerary = {
  id: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
};

export function getFlightItinerariesListProps(tripDetails: TripDetails) {
  const AIRLINES = [
    "Delta Air Lines",
    "United Airlines",
    "American Airlines",
    "Southwest Airlines",
    "JetBlue",
    "Alaska Airlines",
    "Air Canada",
    "LATAM",
    "Emirates",
    "Lufthansa",
  ];

  const getRandomAirline = () =>
    AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

  const getFlightItineraries = (
    fromCity: string,
    toCity: string
  ): FlightItinerary[] => {
    return Array.from({ length: 5 }, () => {
      // Departure is always between 1–10 days from now
      const departureDate = faker.date.soon({ days: 10 });
      // Random duration between 2h–15h
      const durationHours = faker.number.int({ min: 2, max: 15 });
      const durationMinutes = faker.number.int({ min: 0, max: 59 });
      const durationString = `${durationHours}h ${durationMinutes}m`;

      const arrivalDate = new Date(
        departureDate.getTime() +
          durationHours * 60 * 60 * 1000 +
          durationMinutes * 60 * 1000
      );

      return {
        id: faker.string.uuid(),
        airline: getRandomAirline(),
        from: fromCity,
        to: toCity,
        departureTime: departureDate.toISOString(),
        arrivalTime: arrivalDate.toISOString(),
        duration: durationString,
        stops: faker.helpers.arrayElement([0, 1, 2]),
        price: faker.number.int({ min: 200, max: 2000 }),
      };
    });
  };

  return {
    tripDetails,
    itineraries: getFlightItineraries(
      tripDetails.origin,
      tripDetails.destination
    ),
  };
}
