/*
  Warnings:

  - You are about to drop the `Flight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Hotel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Flight";

-- DropTable
DROP TABLE "public"."Hotel";

-- DropEnum
DROP TYPE "public"."FlightStatus";

-- DropEnum
DROP TYPE "public"."HotelStatus";
