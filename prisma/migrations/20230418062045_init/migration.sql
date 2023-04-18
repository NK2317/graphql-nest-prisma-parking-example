-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('public', 'private', 'courtesy');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('corporate', 'provider', 'visitor');

-- CreateTable
CREATE TABLE "Parking" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "slots" INTEGER NOT NULL,
    "aviableSlots" INTEGER NOT NULL DEFAULT 0,
    "parkingType" "ParkingType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" SERIAL NOT NULL,
    "parkingId" INTEGER NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_parkingId_fkey" FOREIGN KEY ("parkingId") REFERENCES "Parking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
