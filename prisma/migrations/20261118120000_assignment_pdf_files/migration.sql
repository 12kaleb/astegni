ALTER TABLE "Assignment"
  ADD COLUMN "filePath" TEXT,
  ADD COLUMN "fileName" TEXT,
  ADD COLUMN "fileSize" INTEGER;

CREATE UNIQUE INDEX "Assignment_filePath_key" ON "Assignment"("filePath");
