ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Assignment_studentId_dueDate_idx" ON "Assignment"("studentId", "dueDate");
CREATE INDEX "TutorProfile_isVerified_openForStudents_rating_idx" ON "TutorProfile"("isVerified", "openForStudents", "rating" DESC);
