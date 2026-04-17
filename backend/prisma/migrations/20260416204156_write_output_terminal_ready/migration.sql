-- CreateTable
CREATE TABLE "LiftWaitReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
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
    CONSTRAINT "LiftWaitReport_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LiftStatusUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "resort_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "lift_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "expected_reopen_at" DATETIME,
    "confirmation_count" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" DATETIME,
    CONSTRAINT "LiftStatusUpdate_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiftStatusUpdate_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiftStatusUpdate_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LiftWaitReport_run_id_created_date_idx" ON "LiftWaitReport"("run_id", "created_date");

-- CreateIndex
CREATE INDEX "LiftWaitReport_resort_id_lift_name_created_date_idx" ON "LiftWaitReport"("resort_id", "lift_name", "created_date");

-- CreateIndex
CREATE INDEX "LiftWaitReport_created_by_run_id_created_date_idx" ON "LiftWaitReport"("created_by", "run_id", "created_date");

-- CreateIndex
CREATE UNIQUE INDEX "LiftWaitReport_created_by_idempotency_key_key" ON "LiftWaitReport"("created_by", "idempotency_key");

-- CreateIndex
CREATE INDEX "LiftStatusUpdate_run_id_created_date_idx" ON "LiftStatusUpdate"("run_id", "created_date");

-- CreateIndex
CREATE INDEX "LiftStatusUpdate_resort_id_lift_name_created_date_idx" ON "LiftStatusUpdate"("resort_id", "lift_name", "created_date");

-- CreateIndex
CREATE INDEX "LiftStatusUpdate_resort_id_lift_name_status_created_date_idx" ON "LiftStatusUpdate"("resort_id", "lift_name", "status", "created_date");
