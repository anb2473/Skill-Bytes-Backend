-- AlterTable
ALTER TABLE "public"."Challenge" ADD COLUMN     "help" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "completedChallenges" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
