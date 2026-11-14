ALTER TABLE "User" ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa';

ALTER TABLE "Lesson"
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
    ADD COLUMN "pendingActionById" TEXT,
    ADD COLUMN "previousScheduledAt" TIMESTAMP(3),
    ADD COLUMN "previousDurationMins" INTEGER,
    ADD COLUMN "pendingActionReason" TEXT,
    ADD COLUMN "rescheduleCount" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "cancelledById" TEXT,
    ADD COLUMN "cancellationReason" TEXT;
ALTER TABLE "Lesson" ALTER COLUMN "updatedAt" DROP DEFAULT;
UPDATE "Lesson" SET "pendingActionById" = "studentId" WHERE "status" = 'PENDING' AND "pendingActionById" IS NULL;
CREATE INDEX "Lesson_tutorId_scheduledAt_idx" ON "Lesson"("tutorId", "scheduledAt");
CREATE INDEX "Lesson_studentId_scheduledAt_idx" ON "Lesson"("studentId", "scheduledAt");

CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Availability_weekday_check" CHECK ("weekday" >= 0 AND "weekday" <= 6),
    CONSTRAINT "Availability_start_minute_check" CHECK ("startMinute" >= 0 AND "startMinute" < 1440),
    CONSTRAINT "Availability_end_minute_check" CHECK ("endMinute" > "startMinute" AND "endMinute" <= 1440)
);
CREATE UNIQUE INDEX "Availability_tutorId_weekday_startMinute_endMinute_key" ON "Availability"("tutorId", "weekday", "startMinute", "endMinute");
CREATE INDEX "Availability_tutorId_weekday_idx" ON "Availability"("tutorId", "weekday");
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Availability" ENABLE ROW LEVEL SECURITY;
