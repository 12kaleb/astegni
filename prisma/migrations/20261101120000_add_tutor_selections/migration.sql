CREATE TABLE "TutorSelection" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorSelection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TutorSelection_studentId_tutorId_key" ON "TutorSelection"("studentId", "tutorId");
CREATE INDEX "TutorSelection_tutorId_idx" ON "TutorSelection"("tutorId");

ALTER TABLE "TutorSelection" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "TutorSelection" ADD CONSTRAINT "TutorSelection_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorSelection" ADD CONSTRAINT "TutorSelection_tutorId_fkey"
  FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
