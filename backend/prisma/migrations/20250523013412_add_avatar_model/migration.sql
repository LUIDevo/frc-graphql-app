-- CreateTable
CREATE TABLE "Avatar" (
    "teamNumber" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" BLOB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_teamNumber_key" ON "Avatar"("teamNumber");
