import path from "path";
import { LocalIndex } from "vectra";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

type TeamMetadata = {
  teamNumber: number;
  eventKey: string;
};

export async function createVectorDB() {
  const indexPath = path.join(__dirname, "vectra_index");

  const index = new LocalIndex<TeamMetadata>(indexPath);
  if (fs.existsSync(indexPath)) {
    fs.rmSync(indexPath, { recursive: true, force: true });
  }

  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }

  const teams = await prisma.team.findMany({
    select: {
      teamNumber: true,
      eventKey: true,
      avgAutoFuel: true,
      avgTeleopFuel: true,
      totalClimbL1: true,
      totalClimbL2: true,
      totalClimbL3: true,
      rankingPoints: true,
      calculatedEPA: true,
    },
  });

  const max = {
    avgAutoFuel: Math.max(...teams.map((t) => t.avgAutoFuel ?? 0)),
    avgTeleopFuel: Math.max(...teams.map((t) => t.avgTeleopFuel ?? 0)),
    totalClimbL1: Math.max(...teams.map((t) => t.totalClimbL1 ?? 0)),
    totalClimbL2: Math.max(...teams.map((t) => t.totalClimbL2 ?? 0)),
    totalClimbL3: Math.max(...teams.map((t) => t.totalClimbL3 ?? 0)),
    rankingPoints: Math.max(...teams.map((t) => t.rankingPoints ?? 0)),
    calculatedEPA: Math.max(...teams.map((t) => t.calculatedEPA ?? 0)),
  };

  function norm(v: number, M: number) {
    return M > 0 ? v / M : 0;
  }

  for (const t of teams) {
    const vector = [
      // fuel scoring ability
      norm(t.avgAutoFuel || 0, max.avgAutoFuel),
      norm(t.avgTeleopFuel || 0, max.avgTeleopFuel),

      // climb level distribution
      norm(t.totalClimbL1 || 0, max.totalClimbL1),
      norm(t.totalClimbL2 || 0, max.totalClimbL2),
      norm(t.totalClimbL3 || 0, max.totalClimbL3),

      // overall performance
      norm(t.rankingPoints || 0, max.rankingPoints),
      norm(t.calculatedEPA || 0, max.calculatedEPA),
    ];

    await index.insertItem({
      vector,
      metadata: { teamNumber: t.teamNumber, eventKey: t.eventKey },
    });
  }

  console.log(`Inserted ${teams.length} teams into Vectra vector DB.`);
}

export const getClosestTeamVectors = async (
  teamNumber: number,
  eventKey: string,
) => {
  const indexPath = path.join(__dirname, "vectra_index");

  const index = new LocalIndex<TeamMetadata>(indexPath);
  const topK = 5;

  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }
  const items = await index.queryItems(
    [],
    JSON.stringify({ teamNumber, eventKey }),
    topK,
  );
  if (items.length === 0) {
    throw new Error(`Team number ${teamNumber} not found in index`);
  }
  const teamVector = items[0].item.vector;

  const filterExcludeSelf = JSON.stringify({ teamNumber: { $ne: teamNumber } });

  const results = await index.queryItems(teamVector, filterExcludeSelf, topK);
  return results;
};

createVectorDB()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
