CREATE TYPE "VerificationDocumentType" AS ENUM ('NATIONAL_ID', 'DEGREE_CERTIFICATE');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');

ALTER TABLE "User" ADD COLUMN "isMinor" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "VerificationDocument" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "type" "VerificationDocumentType" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VerificationDocument_storagePath_key" ON "VerificationDocument"("storagePath");
CREATE INDEX "VerificationDocument_tutorId_status_idx" ON "VerificationDocument"("tutorId", "status");
CREATE INDEX "VerificationDocument_status_createdAt_idx" ON "VerificationDocument"("status", "createdAt");
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "SafetyReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SafetyReport_reportedUserId_status_idx" ON "SafetyReport"("reportedUserId", "status");
CREATE INDEX "SafetyReport_reporterId_createdAt_idx" ON "SafetyReport"("reporterId", "createdAt");
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "UserBlock" (
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("blockerId", "blockedId")
);
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "GuardianConsent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianEmail" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "policyVersion" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "reviewerNote" TEXT,
    CONSTRAINT "GuardianConsent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GuardianConsent_studentId_key" ON "GuardianConsent"("studentId");
CREATE INDEX "GuardianConsent_status_submittedAt_idx" ON "GuardianConsent"("status", "submittedAt");
ALTER TABLE "GuardianConsent" ADD CONSTRAINT "GuardianConsent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VerificationDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SafetyReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GuardianConsent" ENABLE ROW LEVEL SECURITY;
