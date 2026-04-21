-- CreateTable
CREATE TABLE "Lift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "type" TEXT,
    CONSTRAINT "Lift_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LiftStatusUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "lift_id" TEXT,
    "lift_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "expected_reopen_at" DATETIME,
    "confirmation_count" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" DATETIME,
    CONSTRAINT "LiftStatusUpdate_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiftStatusUpdate_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiftStatusUpdate_lift_id_fkey" FOREIGN KEY ("lift_id") REFERENCES "Lift" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LiftStatusUpdate_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LiftStatusUpdate" ("confirmation_count", "created_by", "created_date", "expected_reopen_at", "id", "lift_name", "reason", "resort_id", "run_id", "status", "updated_date", "verified", "verified_at") SELECT "confirmation_count", "created_by", "created_date", "expected_reopen_at", "id", "lift_name", "reason", "resort_id", "run_id", "status", "updated_date", "verified", "verified_at" FROM "LiftStatusUpdate";
DROP TABLE "LiftStatusUpdate";
ALTER TABLE "new_LiftStatusUpdate" RENAME TO "LiftStatusUpdate";
CREATE INDEX "LiftStatusUpdate_run_id_created_date_idx" ON "LiftStatusUpdate"("run_id", "created_date");
CREATE INDEX "LiftStatusUpdate_resort_id_lift_name_created_date_idx" ON "LiftStatusUpdate"("resort_id", "lift_name", "created_date");
CREATE INDEX "LiftStatusUpdate_resort_id_lift_name_status_created_date_idx" ON "LiftStatusUpdate"("resort_id", "lift_name", "status", "created_date");
CREATE TABLE "new_LiftWaitReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "lift_id" TEXT,
    "lift_name" TEXT NOT NULL,
    "wait_minutes" INTEGER NOT NULL,
    "report_status" TEXT NOT NULL DEFAULT 'open',
    "conditions" TEXT,
    "powder_type" TEXT,
    "note" TEXT,
    "day_of_week" INTEGER NOT NULL,
    "hour_of_day" INTEGER NOT NULL,
    "idempotency_key" TEXT,
    "forecast_snowfall_in" REAL,
    CONSTRAINT "LiftWaitReport_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiftWaitReport_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiftWaitReport_lift_id_fkey" FOREIGN KEY ("lift_id") REFERENCES "Lift" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LiftWaitReport_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LiftWaitReport" ("conditions", "created_by", "created_date", "day_of_week", "forecast_snowfall_in", "hour_of_day", "id", "idempotency_key", "lift_name", "note", "powder_type", "report_status", "resort_id", "run_id", "updated_date", "wait_minutes") SELECT "conditions", "created_by", "created_date", "day_of_week", "forecast_snowfall_in", "hour_of_day", "id", "idempotency_key", "lift_name", "note", "powder_type", "report_status", "resort_id", "run_id", "updated_date", "wait_minutes" FROM "LiftWaitReport";
DROP TABLE "LiftWaitReport";
ALTER TABLE "new_LiftWaitReport" RENAME TO "LiftWaitReport";
CREATE INDEX "LiftWaitReport_run_id_created_date_idx" ON "LiftWaitReport"("run_id", "created_date");
CREATE INDEX "LiftWaitReport_resort_id_lift_name_created_date_idx" ON "LiftWaitReport"("resort_id", "lift_name", "created_date");
CREATE INDEX "LiftWaitReport_created_by_run_id_created_date_idx" ON "LiftWaitReport"("created_by", "run_id", "created_date");
CREATE UNIQUE INDEX "LiftWaitReport_created_by_idempotency_key_key" ON "LiftWaitReport"("created_by", "idempotency_key");
CREATE TABLE "new_Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "official_difficulty" TEXT NOT NULL,
    "lift" TEXT,
    "lift_id" TEXT,
    "length_ft" INTEGER,
    "vertical_drop" INTEGER,
    "average_pitch" REAL,
    "max_pitch" REAL,
    "groomed" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    CONSTRAINT "Run_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Run_lift_id_fkey" FOREIGN KEY ("lift_id") REFERENCES "Lift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Run" ("average_pitch", "created_by", "created_date", "description", "groomed", "id", "length_ft", "lift", "max_pitch", "name", "official_difficulty", "resort_id", "updated_date", "vertical_drop") SELECT "average_pitch", "created_by", "created_date", "description", "groomed", "id", "length_ft", "lift", "max_pitch", "name", "official_difficulty", "resort_id", "updated_date", "vertical_drop" FROM "Run";
DROP TABLE "Run";
ALTER TABLE "new_Run" RENAME TO "Run";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Lift_resort_id_name_idx" ON "Lift"("resort_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Lift_resort_id_name_key" ON "Lift"("resort_id", "name");
