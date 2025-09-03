/*
  Warnings:

  - You are about to drop the column `lname` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "lname";

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" SERIAL NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '📢',
    "content" TEXT NOT NULL,
    "bannerColor" TEXT NOT NULL,
    "ownerid" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_ownerid_fkey" FOREIGN KEY ("ownerid") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
