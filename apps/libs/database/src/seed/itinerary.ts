import { prismaClient } from "..";

async function seedItineraries() {
  const itinerariesData = [
    {
      origin: "New York",
      destination: "Los Angeles",
      departureAt: new Date("2023-10-01T08:00:00Z"),
      arrivalAt: new Date("2023-10-01T14:00:00Z"),
      airline: "Airline A",
      flightCode: "AA123",
      priceCents: 30000,
    },
    {
      origin: "San Francisco",
      destination: "New York",
      departureAt: new Date("2023-10-05T09:00:00Z"),
      arrivalAt: new Date("2023-10-05T17:00:00Z"),
      airline: "Airline B",
      flightCode: "BB456",
      priceCents: 40000,
    },
    {
      origin: "Chicago",
      destination: "Miami",
      departureAt: new Date("2023-10-08T07:00:00Z"),
      arrivalAt: new Date("2023-10-08T11:00:00Z"),
      airline: "Airline C",
      flightCode: "CC789",
      priceCents: 25000,
    },
    {
      origin: "Los Angeles",
      destination: "San Francisco",
      departureAt: new Date("2023-10-10T12:00:00Z"),
      arrivalAt: new Date("2023-10-10T13:30:00Z"),
      airline: "Airline D",
      flightCode: "DD321",
      priceCents: 15000,
    },
    {
      origin: "Seattle",
      destination: "Chicago",
      departureAt: new Date("2023-10-12T06:30:00Z"),
      arrivalAt: new Date("2023-10-12T12:00:00Z"),
      airline: "Airline E",
      flightCode: "EE654",
      priceCents: 32000,
    },
    {
      origin: "Boston",
      destination: "Washington D.C.",
      departureAt: new Date("2023-10-15T09:30:00Z"),
      arrivalAt: new Date("2023-10-15T11:00:00Z"),
      airline: "Airline F",
      flightCode: "FF987",
      priceCents: 18000,
    },
    {
      origin: "Miami",
      destination: "Houston",
      departureAt: new Date("2023-10-18T14:00:00Z"),
      arrivalAt: new Date("2023-10-18T16:30:00Z"),
      airline: "Airline G",
      flightCode: "GG159",
      priceCents: 22000,
    },
    {
      origin: "Dallas",
      destination: "Atlanta",
      departureAt: new Date("2023-10-20T07:15:00Z"),
      arrivalAt: new Date("2023-10-20T10:00:00Z"),
      airline: "Airline H",
      flightCode: "HH753",
      priceCents: 27000,
    },
    {
      origin: "Denver",
      destination: "Las Vegas",
      departureAt: new Date("2023-10-22T13:00:00Z"),
      arrivalAt: new Date("2023-10-22T15:30:00Z"),
      airline: "Airline I",
      flightCode: "II852",
      priceCents: 26000,
    },
    {
      origin: "Philadelphia",
      destination: "Orlando",
      departureAt: new Date("2023-10-25T10:00:00Z"),
      arrivalAt: new Date("2023-10-25T13:30:00Z"),
      airline: "Airline J",
      flightCode: "JJ963",
      priceCents: 35000,
    },
  ];

  await prismaClient.itinerary.createMany({
    data: itinerariesData,
  });

  console.log("Seeded 10 itineraries successfully!");
}

// Run the seeder
seedItineraries()
  .then(() => prismaClient.$disconnect())
  .catch((err) => {
    console.error(err);
    prismaClient.$disconnect();
  });
