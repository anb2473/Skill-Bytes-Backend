/*
  Warnings:

  - A unique constraint covering the columns `[ownerid]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[openChallengeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Challenge" ADD COLUMN     "ownerid" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "openChallengeId" INTEGER,
ADD COLUMN     "openChallengeUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "previouslyCompleted" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_ownerid_key" ON "public"."Challenge"("ownerid");

-- CreateIndex
CREATE UNIQUE INDEX "User_openChallengeId_key" ON "public"."User"("openChallengeId");

-- AddForeignKey
ALTER TABLE "public"."Challenge" ADD CONSTRAINT "Challenge_ownerid_fkey" FOREIGN KEY ("ownerid") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
