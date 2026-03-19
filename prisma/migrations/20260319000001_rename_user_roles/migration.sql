-- Rename TEACHER → MANAGER
ALTER TYPE "UserType" RENAME VALUE 'TEACHER' TO 'MANAGER';

-- Rename STUDENT → USER
ALTER TYPE "UserType" RENAME VALUE 'STUDENT' TO 'USER';

-- Update PARENT rows to USER before removing PARENT value
UPDATE "User" SET role = 'USER'::"UserType" WHERE role = 'PARENT'::"UserType";
UPDATE "Message" SET "senderType" = 'USER'::"UserType" WHERE "senderType" = 'PARENT'::"UserType";
UPDATE "ConversationMember" SET "memberType" = 'USER'::"UserType" WHERE "memberType" = 'PARENT'::"UserType";

-- Recreate UserType enum without PARENT
ALTER TYPE "UserType" RENAME TO "UserType_old";
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- Update all columns to use the new type
ALTER TABLE "User" ALTER COLUMN role DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN role TYPE "UserType" USING role::text::"UserType";
ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'USER'::"UserType";

ALTER TABLE "Message" ALTER COLUMN "senderType" TYPE "UserType" USING "senderType"::text::"UserType";
ALTER TABLE "ConversationMember" ALTER COLUMN "memberType" TYPE "UserType" USING "memberType"::text::"UserType";

-- Drop old enum
DROP TYPE "UserType_old";
