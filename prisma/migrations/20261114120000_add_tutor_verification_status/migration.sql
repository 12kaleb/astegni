CREATE TYPE "TutorVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "TutorProfile"
ADD COLUMN "verificationStatus" "TutorVerificationStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "TutorProfile"
SET "verificationStatus" = 'APPROVED'
WHERE "isVerified" = true;
