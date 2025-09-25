/*
  Warnings:

  - You are about to drop the `Itinerary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Flight" DROP CONSTRAINT "Flight_itineraryId_fkey";

-- DropTable
DROP TABLE "public"."Itinerary";
