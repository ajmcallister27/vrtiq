-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Resort" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "country" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "map_image_url" TEXT,
    "website" TEXT,
    "vertical_drop" INTEGER,
    "base_elevation" INTEGER,
    "peak_elevation" INTEGER
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "official_difficulty" TEXT NOT NULL,
    "lift" TEXT,
    "length_ft" INTEGER,
    "vertical_drop" INTEGER,
    "average_pitch" REAL,
    "max_pitch" REAL,
    "groomed" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    CONSTRAINT "Run_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DifficultyRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "skill_level" TEXT,
    "conditions" TEXT,
    "comment" TEXT,
    CONSTRAINT "DifficultyRating_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DifficultyRating_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConditionNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "tags" TEXT,
    "date_observed" DATETIME,
    CONSTRAINT "ConditionNote_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConditionNote_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrossResortComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "run1_id" TEXT NOT NULL,
    "run2_id" TEXT NOT NULL,
    "comparison_type" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "CrossResortComparison_run1_id_fkey" FOREIGN KEY ("run1_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrossResortComparison_run2_id_fkey" FOREIGN KEY ("run2_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrossResortComparison_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
