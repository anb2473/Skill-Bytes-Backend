-- AlterTable
ALTER TABLE "User" ADD COLUMN     "temporaryToken" TEXT,
ADD COLUMN     "tokenUpdated" TIMESTAMP(3);
