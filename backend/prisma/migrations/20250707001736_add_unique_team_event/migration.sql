/*
  Warnings:

  - A unique constraint covering the columns `[teamNumber,eventKey]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Team_teamNumber_eventKey_key" ON "Team"("teamNumber", "eventKey");
