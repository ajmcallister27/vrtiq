-- CreateTable
CREATE TABLE "resorts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "website" TEXT,
    "vertical_drop" INTEGER,
    "base_elevation" INTEGER,
    "peak_elevation" INTEGER,
    "map_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "resorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "official_difficulty" TEXT NOT NULL,
    "lift" TEXT,
    "length_ft" INTEGER,
    "vertical_drop" INTEGER,
    "average_pitch" DOUBLE PRECISION,
    "max_pitch" DOUBLE PRECISION,
    "groomed" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "difficulty_ratings" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "skill_level" TEXT,
    "conditions" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "difficulty_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_notes" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "tags" TEXT[],
    "date_observed" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "condition_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_resort_comparisons" (
    "id" TEXT NOT NULL,
    "run1_id" TEXT NOT NULL,
    "run2_id" TEXT NOT NULL,
    "comparison_type" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "cross_resort_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "runs_resort_id_idx" ON "runs"("resort_id");

-- CreateIndex
CREATE INDEX "difficulty_ratings_run_id_idx" ON "difficulty_ratings"("run_id");

-- CreateIndex
CREATE INDEX "condition_notes_run_id_idx" ON "condition_notes"("run_id");

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "difficulty_ratings" ADD CONSTRAINT "difficulty_ratings_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_notes" ADD CONSTRAINT "condition_notes_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_resort_comparisons" ADD CONSTRAINT "cross_resort_comparisons_run1_id_fkey" FOREIGN KEY ("run1_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_resort_comparisons" ADD CONSTRAINT "cross_resort_comparisons_run2_id_fkey" FOREIGN KEY ("run2_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
