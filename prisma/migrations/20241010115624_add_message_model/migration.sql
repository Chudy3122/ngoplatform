/*
  Warnings:

  - You are about to drop the column `from` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Message` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "recipientId" TEXT,
ADD COLUMN     "senderId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
