ALTER TABLE "TutorProfile" DROP COLUMN "hourlyRateUSD";

UPDATE "TutorProfile"
SET "subjects" = array_remove("subjects", 'Amharic'),
    "languages" = array_remove("languages", 'Amharic')
WHERE 'Amharic' = ANY("subjects") OR 'Amharic' = ANY("languages");
