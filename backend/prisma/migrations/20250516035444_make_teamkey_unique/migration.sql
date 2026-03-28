/*
  Warnings:

  - You are about to drop the column `time` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teamKey]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchKey" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "eventKey" TEXT NOT NULL,
    "redScore" INTEGER,
    "blueScore" INTEGER,
    CONSTRAINT "Match_eventKey_fkey" FOREIGN KEY ("eventKey") REFERENCES "Event" ("eventKey") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("blueScore", "eventKey", "id", "matchKey", "matchNumber", "redScore") SELECT "blueScore", "eventKey", "id", "matchKey", "matchNumber", "redScore" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamKey_key" ON "Team"("teamKey");
