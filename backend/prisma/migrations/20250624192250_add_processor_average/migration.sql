/*
  Warnings:

  - You are about to drop the column `processorCount` on the `Team` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamKey" TEXT NOT NULL,
    "teamNumber" INTEGER NOT NULL,
    "nickname" TEXT,
    "eventKey" TEXT NOT NULL,
    "matchesPlayed" INTEGER,
    "wins" INTEGER,
    "losses" INTEGER,
    "ties" INTEGER,
    "rank" INTEGER,
    "dq" INTEGER,
    "opr" REAL,
    "dpr" REAL,
    "ccwms" REAL,
    "rankingPoints" INTEGER,
    "rankingScore" REAL,
    "avgAuto" REAL,
    "avgBarge" REAL,
    "avgL1" REAL,
    "avgL2" REAL,
    "avgL3" REAL,
    "avgL4" REAL,
    "parkPercentage" REAL,
    "climbPercentage" REAL,
    "climbFailPercentage" REAL,
    "coopCount" INTEGER,
    "penaltyCount" INTEGER,
    "avgProcessor" REAL,
    "endgameReliability" REAL,
    "avgPoints" REAL,
    "stdDevPoints" REAL,
    "calculatedEPA" REAL,
    CONSTRAINT "Team_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("avgAuto", "avgBarge", "avgL1", "avgL2", "avgL3", "avgL4", "avgPoints", "calculatedEPA", "ccwms", "climbFailPercentage", "climbPercentage", "coopCount", "dpr", "dq", "endgameReliability", "eventKey", "id", "losses", "matchesPlayed", "nickname", "opr", "parkPercentage", "penaltyCount", "rank", "rankingPoints", "rankingScore", "stdDevPoints", "teamKey", "teamNumber", "ties", "wins") SELECT "avgAuto", "avgBarge", "avgL1", "avgL2", "avgL3", "avgL4", "avgPoints", "calculatedEPA", "ccwms", "climbFailPercentage", "climbPercentage", "coopCount", "dpr", "dq", "endgameReliability", "eventKey", "id", "losses", "matchesPlayed", "nickname", "opr", "parkPercentage", "penaltyCount", "rank", "rankingPoints", "rankingScore", "stdDevPoints", "teamKey", "teamNumber", "ties", "wins" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_teamKey_key" ON "Team"("teamKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
