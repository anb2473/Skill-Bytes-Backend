-- AlterTable
ALTER TABLE "public"."Challenge" ADD COLUMN     "functionName" TEXT,
ADD COLUMN     "generator" JSONB DEFAULT '{}';
