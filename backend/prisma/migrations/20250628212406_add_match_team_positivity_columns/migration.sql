/*
  Warnings:

  - Added the required column `matchNumber` to the `ScoutingData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamNumber` to the `ScoutingData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScoutingData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "eventKey" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "teamNumber" INTEGER NOT NULL,
    "scoutName" TEXT,
    "autoNotes" TEXT,
    "notes" TEXT,
    "scoredL1" INTEGER,
    "scoredL2" INTEGER,
    "scoredL3" INTEGER,
    "scoredL4" INTEGER,
    "missed" INTEGER,
    "coops" INTEGER,
    "penalties" INTEGER,
    "processors" INTEGER,
    "endgameSuccess" BOOLEAN,
    "totalPoints" INTEGER,
    "positivityScore" REAL,
    CONSTRAINT "ScoutingData_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoutingData_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoutingData_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ScoutingData" ("autoNotes", "coops", "endgameSuccess", "eventKey", "id", "matchId", "missed", "notes", "penalties", "processors", "scoredL1", "scoredL2", "scoredL3", "scoredL4", "scoutName", "teamId", "totalPoints") SELECT "autoNotes", "coops", "endgameSuccess", "eventKey", "id", "matchId", "missed", "notes", "penalties", "processors", "scoredL1", "scoredL2", "scoredL3", "scoredL4", "scoutName", "teamId", "totalPoints" FROM "ScoutingData";
DROP TABLE "ScoutingData";
ALTER TABLE "new_ScoutingData" RENAME TO "ScoutingData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
