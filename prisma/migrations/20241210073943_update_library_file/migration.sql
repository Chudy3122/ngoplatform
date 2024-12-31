/*
  Warnings:

  - The primary key for the `EventParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sharedWithId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `LibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `LibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `LibraryFile` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `LibraryFile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,userId]` on the table `EventParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userType` to the `EventParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessType` to the `FileShare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FileShare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileData` to the `LibraryFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('READ', 'WRITE');

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_admin_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_parent_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_student_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_teacher_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_admin_shared_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_admin_with_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_parent_shared_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_parent_with_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_student_shared_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_student_with_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_teacher_shared_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_teacher_with_fkey";

-- DropForeignKey
ALTER TABLE "LibraryFile" DROP CONSTRAINT "LibraryFile_admin_fkey";

-- DropForeignKey
ALTER TABLE "LibraryFile" DROP CONSTRAINT "LibraryFile_parent_fkey";

-- DropForeignKey
ALTER TABLE "LibraryFile" DROP CONSTRAINT "LibraryFile_student_fkey";

-- DropForeignKey
ALTER TABLE "LibraryFile" DROP CONSTRAINT "LibraryFile_teacher_fkey";

-- DropIndex
DROP INDEX "FileShare_sharedWithId_idx";

-- DropIndex
DROP INDEX "LibraryFile_ownerId_idx";

-- AlterTable
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "userType" TEXT NOT NULL,
ADD CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FileShare" DROP COLUMN "sharedWithId",
ADD COLUMN     "accessType" "AccessType" NOT NULL,
ADD COLUMN     "adminOwnerId" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "parentOwnerId" TEXT,
ADD COLUMN     "sharedWithAdminId" TEXT,
ADD COLUMN     "sharedWithParentId" TEXT,
ADD COLUMN     "sharedWithStudentId" TEXT,
ADD COLUMN     "sharedWithTeacherId" TEXT,
ADD COLUMN     "studentOwnerId" TEXT,
ADD COLUMN     "teacherOwnerId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LibraryFile" DROP COLUMN "isPublic",
DROP COLUMN "ownerId",
DROP COLUMN "path",
DROP COLUMN "url",
ADD COLUMN     "adminOwnerId" TEXT,
ADD COLUMN     "fileData" BYTEA NOT NULL,
ADD COLUMN     "parentOwnerId" TEXT,
ADD COLUMN     "studentOwnerId" TEXT,
ADD COLUMN     "teacherOwnerId" TEXT;

-- CreateTable
CREATE TABLE "SharedFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileData" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "addedBy" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FileShareToSharedFile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Resource_section_idx" ON "Resource"("section");

-- CreateIndex
CREATE UNIQUE INDEX "_FileShareToSharedFile_AB_unique" ON "_FileShareToSharedFile"("A", "B");

-- CreateIndex
CREATE INDEX "_FileShareToSharedFile_B_index" ON "_FileShareToSharedFile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_userId_key" ON "EventParticipant"("eventId", "userId");

-- CreateIndex
CREATE INDEX "FileShare_adminOwnerId_idx" ON "FileShare"("adminOwnerId");

-- CreateIndex
CREATE INDEX "FileShare_teacherOwnerId_idx" ON "FileShare"("teacherOwnerId");

-- CreateIndex
CREATE INDEX "FileShare_studentOwnerId_idx" ON "FileShare"("studentOwnerId");

-- CreateIndex
CREATE INDEX "FileShare_parentOwnerId_idx" ON "FileShare"("parentOwnerId");

-- CreateIndex
CREATE INDEX "FileShare_sharedWithAdminId_idx" ON "FileShare"("sharedWithAdminId");

-- CreateIndex
CREATE INDEX "FileShare_sharedWithTeacherId_idx" ON "FileShare"("sharedWithTeacherId");

-- CreateIndex
CREATE INDEX "FileShare_sharedWithStudentId_idx" ON "FileShare"("sharedWithStudentId");

-- CreateIndex
CREATE INDEX "FileShare_sharedWithParentId_idx" ON "FileShare"("sharedWithParentId");

-- CreateIndex
CREATE INDEX "LibraryFile_adminOwnerId_idx" ON "LibraryFile"("adminOwnerId");

-- CreateIndex
CREATE INDEX "LibraryFile_teacherOwnerId_idx" ON "LibraryFile"("teacherOwnerId");

-- CreateIndex
CREATE INDEX "LibraryFile_studentOwnerId_idx" ON "LibraryFile"("studentOwnerId");

-- CreateIndex
CREATE INDEX "LibraryFile_parentOwnerId_idx" ON "LibraryFile"("parentOwnerId");

-- RenameForeignKey
ALTER TABLE "FileShare" RENAME CONSTRAINT "FileShare_file_fkey" TO "FileShare_fileId_fkey";

-- AddForeignKey
ALTER TABLE "LibraryFile" ADD CONSTRAINT "LibraryFile_adminOwnerId_fkey" FOREIGN KEY ("adminOwnerId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFile" ADD CONSTRAINT "LibraryFile_teacherOwnerId_fkey" FOREIGN KEY ("teacherOwnerId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFile" ADD CONSTRAINT "LibraryFile_studentOwnerId_fkey" FOREIGN KEY ("studentOwnerId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFile" ADD CONSTRAINT "LibraryFile_parentOwnerId_fkey" FOREIGN KEY ("parentOwnerId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_adminOwnerId_fkey" FOREIGN KEY ("adminOwnerId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_teacherOwnerId_fkey" FOREIGN KEY ("teacherOwnerId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_studentOwnerId_fkey" FOREIGN KEY ("studentOwnerId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_parentOwnerId_fkey" FOREIGN KEY ("parentOwnerId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedWithAdminId_fkey" FOREIGN KEY ("sharedWithAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedWithTeacherId_fkey" FOREIGN KEY ("sharedWithTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedWithStudentId_fkey" FOREIGN KEY ("sharedWithStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedWithParentId_fkey" FOREIGN KEY ("sharedWithParentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileShareToSharedFile" ADD CONSTRAINT "_FileShareToSharedFile_A_fkey" FOREIGN KEY ("A") REFERENCES "FileShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileShareToSharedFile" ADD CONSTRAINT "_FileShareToSharedFile_B_fkey" FOREIGN KEY ("B") REFERENCES "SharedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
