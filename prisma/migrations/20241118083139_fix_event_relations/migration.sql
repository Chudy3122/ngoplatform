-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_authorId_fkey";

-- DropForeignKey
ALTER TABLE "EventComment" DROP CONSTRAINT "EventComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_userId_fkey";

-- CreateIndex
CREATE INDEX "Event_authorId_idx" ON "Event"("authorId");

-- CreateIndex
CREATE INDEX "EventComment_authorId_idx" ON "EventComment"("authorId");

-- CreateIndex
CREATE INDEX "EventComment_eventId_idx" ON "EventComment"("eventId");

-- CreateIndex
CREATE INDEX "EventParticipant_userId_idx" ON "EventParticipant"("userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_student_fkey" FOREIGN KEY ("authorId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_teacher_fkey" FOREIGN KEY ("authorId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_admin_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_parent_fkey" FOREIGN KEY ("authorId") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_student_fkey" FOREIGN KEY ("userId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_teacher_fkey" FOREIGN KEY ("userId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_parent_fkey" FOREIGN KEY ("userId") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_admin_fkey" FOREIGN KEY ("userId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_student_fkey" FOREIGN KEY ("authorId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_teacher_fkey" FOREIGN KEY ("authorId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_parent_fkey" FOREIGN KEY ("authorId") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_admin_fkey" FOREIGN KEY ("authorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
