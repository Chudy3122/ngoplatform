-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "members" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);
