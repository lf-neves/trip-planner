/*
  Warnings:

  - You are about to drop the column `created_at` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary_id` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `passenger_email` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `passenger_name` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `check_in` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `guest_email` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `guest_name` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_id` on the `Hotel` table. All the data in the column will be lost.
  - Added the required column `itineraryId` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passengerEmail` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passengerName` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkIn` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestEmail` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestName` to the `Hotel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."FlightStatus" ADD VALUE 'PENDING';

-- AlterEnum
ALTER TYPE "public"."HotelStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "public"."Flight" DROP COLUMN "created_at",
DROP COLUMN "itinerary_id",
DROP COLUMN "passenger_email",
DROP COLUMN "passenger_name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "itineraryId" TEXT NOT NULL,
ADD COLUMN     "passengerEmail" TEXT NOT NULL,
ADD COLUMN     "passengerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Hotel" DROP COLUMN "check_in",
DROP COLUMN "created_at",
DROP COLUMN "guest_email",
DROP COLUMN "guest_name",
DROP COLUMN "hotel_id",
ADD COLUMN     "checkIn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "guestEmail" TEXT NOT NULL,
ADD COLUMN     "guestName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Itinerary" (
    "itineraryId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureAt" TIMESTAMP(3) NOT NULL,
    "arrivalAt" TIMESTAMP(3) NOT NULL,
    "airline" TEXT NOT NULL,
    "flightCode" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("itineraryId")
);

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "public"."Itinerary"("itineraryId") ON DELETE RESTRICT ON UPDATE CASCADE;
