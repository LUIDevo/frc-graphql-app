-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "TBA_API_KEY" TEXT NOT NULL,
    "GEMINI_API_KEY" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamKey" TEXT NOT NULL,
    "teamNumber" INTEGER NOT NULL,
    "nickname" TEXT,
    "eventId" INTEGER NOT NULL,
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
    CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchKey" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "redScore" INTEGER,
    "blueScore" INTEGER,
    "time" DATETIME,
    CONSTRAINT "Match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoutingData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
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
    CONSTRAINT "ScoutingData_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RedAlliance" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_RedAlliance_A_fkey" FOREIGN KEY ("A") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RedAlliance_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlueAlliance" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlueAlliance_A_fkey" FOREIGN KEY ("A") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlueAlliance_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_RedAlliance_AB_unique" ON "_RedAlliance"("A", "B");

-- CreateIndex
CREATE INDEX "_RedAlliance_B_index" ON "_RedAlliance"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlueAlliance_AB_unique" ON "_BlueAlliance"("A", "B");

-- CreateIndex
CREATE INDEX "_BlueAlliance_B_index" ON "_BlueAlliance"("B");
