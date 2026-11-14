CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- Prisma remains the only application data access path. RLS denies access to
-- anon/authenticated roles unless an explicit policy is added in a later review.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TutorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TutorSelection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubjectProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitBucket" ENABLE ROW LEVEL SECURITY;
