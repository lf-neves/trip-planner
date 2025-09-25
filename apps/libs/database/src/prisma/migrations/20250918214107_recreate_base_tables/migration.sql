-- CreateEnum
CREATE TYPE "public"."FlightStatus" AS ENUM ('TICKETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."HotelStatus" AS ENUM ('BOOKED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."Flight" (
    "flightId" TEXT NOT NULL,
    "pnr" TEXT NOT NULL,
    "status" "public"."FlightStatus" NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "passenger_name" TEXT NOT NULL,
    "passenger_email" TEXT NOT NULL,
    "itinerary_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("flightId")
);

-- CreateTable
CREATE TABLE "public"."Hotel" (
    "hotelId" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "status" "public"."HotelStatus" NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "guest_name" TEXT NOT NULL,
    "guest_email" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "checkout" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("hotelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flight_pnr_key" ON "public"."Flight"("pnr");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_reservation_id_key" ON "public"."Hotel"("reservation_id");
