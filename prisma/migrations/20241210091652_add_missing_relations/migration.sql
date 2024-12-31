/*
  Warnings:

  - You are about to drop the column `adminOwnerId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `parentOwnerId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `sharedWithAdminId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `sharedWithParentId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `sharedWithStudentId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `sharedWithTeacherId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `studentOwnerId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `teacherOwnerId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the `SharedFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FileShareToSharedFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_adminOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_parentOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_sharedWithAdminId_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_sharedWithParentId_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_sharedWithStudentId_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_sharedWithTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_studentOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_teacherOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "_FileShareToSharedFile" DROP CONSTRAINT "_FileShareToSharedFile_A_fkey";

-- DropForeignKey
ALTER TABLE "_FileShareToSharedFile" DROP CONSTRAINT "_FileShareToSharedFile_B_fkey";

-- DropIndex
DROP INDEX "FileShare_adminOwnerId_idx";

-- DropIndex
DROP INDEX "FileShare_parentOwnerId_idx";

-- DropIndex
DROP INDEX "FileShare_sharedWithAdminId_idx";

-- DropIndex
DROP INDEX "FileShare_sharedWithParentId_idx";

-- DropIndex
DROP INDEX "FileShare_sharedWithStudentId_idx";

-- DropIndex
DROP INDEX "FileShare_sharedWithTeacherId_idx";

-- DropIndex
DROP INDEX "FileShare_studentOwnerId_idx";

-- DropIndex
DROP INDEX "FileShare_teacherOwnerId_idx";

-- AlterTable
ALTER TABLE "FileShare" DROP COLUMN "adminOwnerId",
DROP COLUMN "parentOwnerId",
DROP COLUMN "sharedWithAdminId",
DROP COLUMN "sharedWithParentId",
DROP COLUMN "sharedWithStudentId",
DROP COLUMN "sharedWithTeacherId",
DROP COLUMN "studentOwnerId",
DROP COLUMN "teacherOwnerId",
DROP COLUMN "userId",
ADD COLUMN     "sharedByAdminId" TEXT,
ADD COLUMN     "sharedByParentId" TEXT,
ADD COLUMN     "sharedByStudentId" TEXT,
ADD COLUMN     "sharedByTeacherId" TEXT,
ADD COLUMN     "sharedToAdminId" TEXT,
ADD COLUMN     "sharedToParentId" TEXT,
ADD COLUMN     "sharedToStudentId" TEXT,
ADD COLUMN     "sharedToTeacherId" TEXT;

-- DropTable
DROP TABLE "SharedFile";

-- DropTable
DROP TABLE "_FileShareToSharedFile";

-- CreateIndex
CREATE INDEX "FileShare_sharedByAdminId_idx" ON "FileShare"("sharedByAdminId");

-- CreateIndex
CREATE INDEX "FileShare_sharedByTeacherId_idx" ON "FileShare"("sharedByTeacherId");

-- CreateIndex
CREATE INDEX "FileShare_sharedByStudentId_idx" ON "FileShare"("sharedByStudentId");

-- CreateIndex
CREATE INDEX "FileShare_sharedByParentId_idx" ON "FileShare"("sharedByParentId");

-- CreateIndex
CREATE INDEX "FileShare_sharedToAdminId_idx" ON "FileShare"("sharedToAdminId");

-- CreateIndex
CREATE INDEX "FileShare_sharedToTeacherId_idx" ON "FileShare"("sharedToTeacherId");

-- CreateIndex
CREATE INDEX "FileShare_sharedToStudentId_idx" ON "FileShare"("sharedToStudentId");

-- CreateIndex
CREATE INDEX "FileShare_sharedToParentId_idx" ON "FileShare"("sharedToParentId");

-- RenameForeignKey
ALTER TABLE "EventComment" RENAME CONSTRAINT "EventComment_admin_fkey" TO "EventComment_admin_author_fkey";

-- RenameForeignKey
ALTER TABLE "EventComment" RENAME CONSTRAINT "EventComment_parent_fkey" TO "EventComment_parent_author_fkey";

-- RenameForeignKey
ALTER TABLE "EventComment" RENAME CONSTRAINT "EventComment_student_fkey" TO "EventComment_student_author_fkey";

-- RenameForeignKey
ALTER TABLE "EventComment" RENAME CONSTRAINT "EventComment_teacher_fkey" TO "EventComment_teacher_author_fkey";

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedByAdminId_fkey" FOREIGN KEY ("sharedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedByTeacherId_fkey" FOREIGN KEY ("sharedByTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedByStudentId_fkey" FOREIGN KEY ("sharedByStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedByParentId_fkey" FOREIGN KEY ("sharedByParentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedToAdminId_fkey" FOREIGN KEY ("sharedToAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedToTeacherId_fkey" FOREIGN KEY ("sharedToTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedToStudentId_fkey" FOREIGN KEY ("sharedToStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedToParentId_fkey" FOREIGN KEY ("sharedToParentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
