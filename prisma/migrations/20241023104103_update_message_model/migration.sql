/*
  Warnings:

  - You are about to drop the column `groupId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropIndex
DROP INDEX "Message_groupId_idx";

-- DropIndex
DROP INDEX "Message_recipientId_idx";

-- DropIndex
DROP INDEX "Message_senderId_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "groupId";
