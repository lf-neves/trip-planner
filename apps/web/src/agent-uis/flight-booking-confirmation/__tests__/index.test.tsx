import { render, screen } from "@testing-library/react";
import { TripDetails } from "@/agent/trip-planner/types";
import { Accommodation } from "@/agent/types";
import { BookedAccommodation } from "../../accommodations-list/bookedAccommodation";

// TODO: improve tests setup and coverage

describe("BookedAccommodation", () => {
  const mockAccommodation: Accommodation = {
    id: "1",
    name: "Hotel Sunshine",
    city: "miami",
    rating: 4.5,
    price: 100,
    image: "https://example.com/hotel.jpg",
  };

  const mockTripDetails: TripDetails = {
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-09-05"),
    numberOfGuests: 2,
    destination: "Miami",
    origin: "New York",
  };

  test("renders booked accommodation details correctly", () => {
    // act
    render(
      <BookedAccommodation
        accommodation={mockAccommodation}
        tripDetails={mockTripDetails}
      />,
    );

    // assert
    expect(screen.getByText("Booked Accommodation")).toBeInTheDocument();
    expect(screen.getByText(/Hotel Sunshine, Miami/)).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });
});
