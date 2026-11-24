CREATE TABLE "TutorStudentMessage" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "tutorId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "text" VARCHAR(2000) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TutorStudentMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TutorStudentMessage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TutorStudentMessage_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TutorStudentMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "TutorStudentMessage_studentId_tutorId_createdAt_idx" ON "TutorStudentMessage"("studentId", "tutorId", "createdAt");

CREATE TABLE "StudentCurriculumItem" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "tutorId" TEXT NOT NULL,
  "text" VARCHAR(500) NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentCurriculumItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentCurriculumItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudentCurriculumItem_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "StudentCurriculumItem_studentId_tutorId_createdAt_idx" ON "StudentCurriculumItem"("studentId", "tutorId", "createdAt");
