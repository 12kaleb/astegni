CREATE TYPE "LessonSessionItemType" AS ENUM ('CHAT', 'AGENDA', 'NOTE');

ALTER TABLE "Lesson" ADD COLUMN "startedAt" TIMESTAMP(3), ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE TABLE "LessonSessionItem" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "LessonSessionItemType" NOT NULL,
    "text" VARCHAR(2000) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LessonSessionItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonSessionItem_lessonId_type_createdAt_idx" ON "LessonSessionItem"("lessonId", "type", "createdAt");
CREATE INDEX "LessonSessionItem_authorId_type_idx" ON "LessonSessionItem"("authorId", "type");

ALTER TABLE "LessonSessionItem" ADD CONSTRAINT "LessonSessionItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonSessionItem" ADD CONSTRAINT "LessonSessionItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
