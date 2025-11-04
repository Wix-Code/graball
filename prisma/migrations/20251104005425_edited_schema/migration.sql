-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'FOLLOW';

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "image" TEXT;
