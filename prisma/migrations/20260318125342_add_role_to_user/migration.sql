/*
  Warnings:

  - You are about to drop the column `authorId` on the `Announcement` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "authorId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserType" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "roleId" TEXT NOT NULL;
