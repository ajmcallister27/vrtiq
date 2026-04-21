-- AlterTable
ALTER TABLE "DifficultyRating" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'ski';

-- Backfill legacy ratings to ski mode.
UPDATE "DifficultyRating"
SET "mode" = 'ski'
WHERE "mode" IS NULL OR "mode" = '';
