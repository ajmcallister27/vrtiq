-- CreateTable
CREATE TABLE "PendingEditRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT,
    "entity_type" TEXT NOT NULL,
    "resort_id" TEXT,
    "run_id" TEXT,
    "submitter_name" TEXT,
    "submitter_email" TEXT,
    "suggestion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "PendingEditRequest_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "Resort" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PendingEditRequest_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PendingEditRequest_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PendingEditRequest_status_idx" ON "PendingEditRequest"("status");

-- CreateIndex
CREATE INDEX "PendingEditRequest_resort_id_idx" ON "PendingEditRequest"("resort_id");

-- CreateIndex
CREATE INDEX "PendingEditRequest_run_id_idx" ON "PendingEditRequest"("run_id");
