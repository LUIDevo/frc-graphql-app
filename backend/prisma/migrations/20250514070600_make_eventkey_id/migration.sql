/*
  Warnings:

  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `ScoutingData` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Team` table. All the data in the column will be lost.
  - Added the required column `eventKey` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventKey` to the `ScoutingData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventKey` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "eventKey" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("endDate", "eventKey", "name", "startDate") SELECT "endDate", "eventKey", "name", "startDate" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchKey" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "eventKey" TEXT NOT NULL,
    "redScore" INTEGER,
    "blueScore" INTEGER,
    "time" DATETIME,
    CONSTRAINT "Match_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("blueScore", "id", "matchKey", "matchNumber", "redScore", "time") SELECT "blueScore", "id", "matchKey", "matchNumber", "redScore", "time" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE TABLE "new_ScoutingData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "eventKey" TEXT NOT NULL,
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
    CONSTRAINT "ScoutingData_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoutingData_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoutingData_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ScoutingData" ("autoNotes", "coops", "endgameSuccess", "id", "matchId", "missed", "notes", "penalties", "processors", "scoredL1", "scoredL2", "scoredL3", "scoredL4", "scoutName", "teamId", "totalPoints") SELECT "autoNotes", "coops", "endgameSuccess", "id", "matchId", "missed", "notes", "penalties", "processors", "scoredL1", "scoredL2", "scoredL3", "scoredL4", "scoutName", "teamId", "totalPoints" FROM "ScoutingData";
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
    "avgBarge" REAL,
    "avgL1" REAL,
    "avgL2" REAL,
    "avgL3" REAL,
    "avgL4" REAL,
    "coopCount" INTEGER,
    "penaltyCount" INTEGER,
    "processorCount" INTEGER,
    "endgameReliability" REAL,
    "avgPoints" REAL,
    "stdDevPoints" REAL,
    "calculatedEPA" REAL,
    CONSTRAINT "Team_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("avgAuto", "avgBarge", "avgL1", "avgL2", "avgL3", "avgL4", "avgPoints", "calculatedEPA", "ccwms", "coopCount", "dpr", "dq", "endgameReliability", "id", "losses", "matchesPlayed", "nickname", "opr", "penaltyCount", "processorCount", "rank", "rankingPoints", "rankingScore", "stdDevPoints", "teamKey", "teamNumber", "ties", "wins") SELECT "avgAuto", "avgBarge", "avgL1", "avgL2", "avgL3", "avgL4", "avgPoints", "calculatedEPA", "ccwms", "coopCount", "dpr", "dq", "endgameReliability", "id", "losses", "matchesPlayed", "nickname", "opr", "penaltyCount", "processorCount", "rank", "rankingPoints", "rankingScore", "stdDevPoints", "teamKey", "teamNumber", "ties", "wins" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
