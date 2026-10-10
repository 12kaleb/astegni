-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "experienceYears" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gradeLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "modes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT,
ADD COLUMN     "university" TEXT;
