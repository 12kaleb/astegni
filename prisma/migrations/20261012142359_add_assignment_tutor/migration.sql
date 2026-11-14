-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "tutorId" TEXT;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
