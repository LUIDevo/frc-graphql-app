/*
  Warnings:

  - You are about to drop the column `climbFailPercentage` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `climbPercentage` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `parkPercentage` on the `Team` table. All the data in the column will be lost.

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
    "endgameSuccess" TEXT,
    "totalPoints" INTEGER,
    "positivityScore" REAL,
    CONSTRAINT "ScoutingData_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoutingData_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoutingData_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ScoutingData" ("autoNotes", "coops", "endgameSuccess", "eventKey", "id", "matchId", "matchNumber", "missed", "notes", "penalties", "positivityScore", "processors", "scoredL1", "scoredL2", "scoredL3", "scoredL4", "scoutName", "teamId", "teamNumber", "totalPoints") SELECT "autoNotes", "coops", "endgameSuccess", "eventKey", "id", "matchId", "matchNumber", "missed", "notes", "penalties", "positivityScore", "processors", "scoredL1", "scoredL2", "scoredL3", "scoredL4", "scoutName", "teamId", "teamNumber", "totalPoints" FROM "ScoutingData";
DROP TABLE "ScoutingData";
ALTER TABLE "new_ScoutingData" RENAME TO "ScoutingData";
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
    "avgL1" REAL,
    "avgL2" REAL,
    "avgL3" REAL,
    "avgL4" REAL,
    "totalPark" REAL,
    "totalClimb" REAL,
    "totalClimbFail" REAL,
    "coopCount" INTEGER,
    "penaltyCount" INTEGER,
    "avgBarge" REAL,
    "avgProcessor" REAL,
    "avgAlgae" REAL,
    "endgameReliability" REAL,
    "avgPoints" REAL,
    "stdDevPoints" REAL,
    "calculatedEPA" REAL,
    CONSTRAINT "Team_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("avgAlgae", "avgAuto", "avgBarge", "avgL1", "avgL2", "avgL3", "avgL4", "avgPoints", "avgProcessor", "calculatedEPA", "ccwms", "coopCount", "dpr", "dq", "endgameReliability", "eventKey", "id", "losses", "matchesPlayed", "nickname", "opr", "penaltyCount", "rank", "rankingPoints", "rankingScore", "stdDevPoints", "teamKey", "teamNumber", "ties", "wins") SELECT "avgAlgae", "avgAuto", "avgBarge", "avgL1", "avgL2", "avgL3", "avgL4", "avgPoints", "avgProcessor", "calculatedEPA", "ccwms", "coopCount", "dpr", "dq", "endgameReliability", "eventKey", "id", "losses", "matchesPlayed", "nickname", "opr", "penaltyCount", "rank", "rankingPoints", "rankingScore", "stdDevPoints", "teamKey", "teamNumber", "ties", "wins" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_teamKey_key" ON "Team"("teamKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
