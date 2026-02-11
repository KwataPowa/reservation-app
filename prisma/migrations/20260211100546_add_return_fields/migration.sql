-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'RETURNED';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "returnHasIssue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnNote" TEXT,
ADD COLUMN     "returnedAt" TIMESTAMP(3);
