/*
  Warnings:

  - You are about to drop the column `authorId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_admin_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_parent_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_student_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_teacher_fkey";

-- DropIndex
DROP INDEX "Event_authorId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "authorId",
ADD COLUMN     "authorAdminId" TEXT,
ADD COLUMN     "authorParentId" TEXT,
ADD COLUMN     "authorStudentId" TEXT,
ADD COLUMN     "authorTeacherId" TEXT;

-- CreateIndex
CREATE INDEX "Event_authorStudentId_idx" ON "Event"("authorStudentId");

-- CreateIndex
CREATE INDEX "Event_authorTeacherId_idx" ON "Event"("authorTeacherId");

-- CreateIndex
CREATE INDEX "Event_authorAdminId_idx" ON "Event"("authorAdminId");

-- CreateIndex
CREATE INDEX "Event_authorParentId_idx" ON "Event"("authorParentId");

-- CreateIndex
CREATE INDEX "Event_classId_idx" ON "Event"("classId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorStudentId_fkey" FOREIGN KEY ("authorStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorTeacherId_fkey" FOREIGN KEY ("authorTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorAdminId_fkey" FOREIGN KEY ("authorAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorParentId_fkey" FOREIGN KEY ("authorParentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
