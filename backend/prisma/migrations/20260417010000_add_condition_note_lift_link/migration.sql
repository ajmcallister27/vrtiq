-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_ConditionNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "run_id" TEXT,
    "lift_id" TEXT,
    "note" TEXT NOT NULL,
    "tags" TEXT,
    "date_observed" DATETIME,
    CONSTRAINT "ConditionNote_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ConditionNote_lift_id_fkey" FOREIGN KEY ("lift_id") REFERENCES "Lift" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ConditionNote_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_ConditionNote" (
    "id", "created_date", "updated_date", "created_by", "run_id", "lift_id", "note", "tags", "date_observed"
)
SELECT
    "id", "created_date", "updated_date", "created_by", "run_id", NULL, "note", "tags", "date_observed"
FROM "ConditionNote";

DROP TABLE "ConditionNote";
ALTER TABLE "new_ConditionNote" RENAME TO "ConditionNote";
CREATE INDEX "ConditionNote_run_id_created_date_idx" ON "ConditionNote"("run_id", "created_date");
CREATE INDEX "ConditionNote_lift_id_created_date_idx" ON "ConditionNote"("lift_id", "created_date");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;