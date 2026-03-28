import prisma from "../prisma";
import fs from "fs";
import path from "path";
import { uploadCsvToGraphql } from "../csv/parseCSV";
import { createVectorDB } from "../utils/addVectors";
import { scoutingLogsArgs, IngestScoutingDataArgs } from "../models/types";

const filePath = path.resolve(__dirname, "../csv/data.csv");

function isError(error: unknown): error is Error {
  return typeof error === "object" && error !== null && "message" in error;
}

export const scoutingResolvers = {
  Query: {
    getTeamScoutingData: async (_: unknown, { eventKey, teamNumber }: { eventKey: string; teamNumber: number }) => {
      return prisma.scoutingData.findMany({
        where: { eventKey, teamNumber },
        orderBy: { matchNumber: "asc" },
      });
    },
    getUnmatchedLogs: async (_: unknown, { eventKey }: { eventKey: string }) => {
      return prisma.unmatchedScoutingLog.findMany({
        where: { eventKey },
        orderBy: { createdAt: "desc" },
      });
    },
  },
  Mutation: {
    ingestScoutingData: async (
      _: unknown,
      { eventKey, data }: IngestScoutingDataArgs,
    ): Promise<{ success: boolean; message: string; uploadedCount: number }> => {
      console.log(`Received a batch of ${data.length} scouting data entries for upload.`);
      console.log("Event key:", eventKey);
      console.log("First data entry:", data[0]);

      let uploadedCount = 0;
      const errors: string[] = [];
      const affectedTeams = new Set<string>();

      await prisma.$transaction(async (tx) => {
        for (const entry of data) {
          try {
            const match = await tx.match.findFirst({
              where: { matchNumber: entry.matchNumber, eventKey },
              select: { id: true, eventKey: true, matchNumber: true },
            });
            console.log(
              `Looking for match ${entry.matchNumber} in event ${eventKey}, found:`,
              match,
            );

            if (!match) {
              const errorMessage = `Match with matchNumber ${entry.matchNumber} not found. Skipping entry for team ${entry.teamNumber}.`;
              console.warn(errorMessage);
              errors.push(errorMessage);
              await tx.unmatchedScoutingLog.create({
                data: {
                  eventKey,
                  matchNumber: entry.matchNumber,
                  teamNumber: entry.teamNumber,
                  scoutName: entry.scoutName,
                  autoNotes: entry.autoNotes,
                  notes: entry.notes,
                  autoFuel: entry.autoFuel,
                  teleopFuel: entry.teleopFuel,
                  missed: entry.missed,
                  climbLevel: entry.climbLevel,
                  autoClimb: entry.autoClimb,
                  penalties: entry.penalties,
                  totalPoints: entry.totalPoints,
                  positivityScore: entry.positivityScore,
                  reason: errorMessage,
                },
              });
              continue;
            }

            const team = await tx.team.findFirst({
              where: { teamNumber: entry.teamNumber, eventKey },
              select: { id: true, teamNumber: true },
            });
            console.log(
              `Looking for team ${entry.teamNumber} in event ${eventKey}, found:`,
              team,
            );

            if (!team) {
              const errorMessage = `Team with teamNumber ${entry.teamNumber} not found in event ${eventKey}. Skipping entry for match ${entry.matchNumber}.`;
              console.warn(errorMessage);
              errors.push(errorMessage);
              await tx.unmatchedScoutingLog.create({
                data: {
                  eventKey,
                  matchNumber: entry.matchNumber,
                  teamNumber: entry.teamNumber,
                  scoutName: entry.scoutName,
                  autoNotes: entry.autoNotes,
                  notes: entry.notes,
                  autoFuel: entry.autoFuel,
                  teleopFuel: entry.teleopFuel,
                  missed: entry.missed,
                  climbLevel: entry.climbLevel,
                  autoClimb: entry.autoClimb,
                  penalties: entry.penalties,
                  totalPoints: entry.totalPoints,
                  positivityScore: entry.positivityScore,
                  reason: errorMessage,
                },
              });
              continue;
            }

            affectedTeams.add(`${entry.teamNumber}|${match.eventKey}`);
            await tx.scoutingData.create({
              data: {
                matchId: match.id,
                teamId: team.id,
                eventKey: match.eventKey,
                matchNumber: match.matchNumber,
                teamNumber: team.teamNumber,
                scoutName: entry.scoutName,
                autoNotes: entry.autoNotes,
                notes: entry.notes,
                autoFuel: entry.autoFuel,
                teleopFuel: entry.teleopFuel,
                missed: entry.missed,
                climbLevel: entry.climbLevel,
                autoClimb: entry.autoClimb,
                penalties: entry.penalties,
                totalPoints: entry.totalPoints,
                positivityScore: entry.positivityScore,
              },
            });
            uploadedCount++;
          } catch (createError: unknown) {
            const errorMessage = isError(createError)
              ? createError.message
              : String(createError);
            const fullErrorMessage = `Error creating ScoutingData entry for match ${entry.matchNumber}, team ${entry.teamNumber}: ${errorMessage}`;
            console.error(fullErrorMessage);
            errors.push(fullErrorMessage);
          }
        }

        function calculateStdDev(points: number[]) {
          const mean = points.reduce((sum, p) => sum + p, 0) / points.length;
          const variance =
            points.reduce((sum, p) => sum + (p - mean) ** 2, 0) / points.length;
          return Math.sqrt(variance);
        }

        for (const key of affectedTeams) {
          const [teamNumberStr, eventKey] = key.split("|");
          const teamNumber = parseInt(teamNumberStr);

          const team = await tx.team.findFirst({ where: { teamNumber, eventKey } });
          if (!team) continue;

          const scoutingEntries = await tx.scoutingData.findMany({
            where: { teamNumber, eventKey },
          });
          if (scoutingEntries.length === 0) {
            console.warn(
              `No scouting data entries found for team ${teamNumber} in event ${eventKey}. Skipping Team update.`,
            );
            continue;
          }

          const avg = (key: keyof (typeof scoutingEntries)[0]) =>
            scoutingEntries.reduce((sum, e) => sum + Number(e[key] ?? 0), 0) /
            scoutingEntries.length;
          const sum = (key: keyof (typeof scoutingEntries)[0]) =>
            scoutingEntries.reduce((sum, e) => sum + Number(e[key] ?? 0), 0);
          const countOfType = (
            typeKey: keyof (typeof scoutingEntries)[0],
            typeValue: string,
          ): number =>
            scoutingEntries.filter((e) => e[typeKey] === typeValue).length;

          const climbPoints = (level: string | null) => {
            if (level === "level1") return 10;
            if (level === "level2") return 20;
            if (level === "level3") return 30;
            return 0;
          };
          const totalClimbPoints = scoutingEntries.reduce(
            (sum, e) => sum + climbPoints(e.climbLevel),
            0,
          );
          const endgameReliability =
            scoutingEntries.length > 0 ? totalClimbPoints / scoutingEntries.length : 0;

          const pointsArray = scoutingEntries
            .map((entry) => entry.totalPoints ?? 0)
            .filter((p) => p !== null);

          try {
            await tx.team.update({
              where: { teamNumber_eventKey: { eventKey, teamNumber } },
              data: {
                avgAutoFuel: avg("autoFuel"),
                avgTeleopFuel: avg("teleopFuel"),
                avgTotalFuel: avg("autoFuel") + avg("teleopFuel"),
                totalClimbL1: countOfType("climbLevel", "level1"),
                totalClimbL2: countOfType("climbLevel", "level2"),
                totalClimbL3: countOfType("climbLevel", "level3"),
                totalClimbFail: countOfType("climbLevel", "none"),
                penaltyCount: sum("penalties"),
                endgameReliability,
                calculatedEPA:
                  avg("autoFuel") * 1 + avg("teleopFuel") * 1 + endgameReliability,
                stdDevPoints: calculateStdDev(pointsArray),
              },
            });
          } catch (e) {
            console.log("BIG ERROR HERE", e);
          }
        }
      });

      if (uploadedCount > 0) {
        const baseMsg = `Uploaded ${uploadedCount} entries.${errors.length ? ` ${errors.length} skipped.` : ""}`;
        return {
          success: true,
          message: baseMsg + (errors.length ? "\n\nErrors:\n" + errors.join("\n") : ""),
          uploadedCount,
        };
      } else {
        const message = `No entries uploaded. ${errors.length} errors:\n` + errors.join("\n");
        console.warn(message);
        return { success: false, message, uploadedCount: 0 };
      }
    },
    uploadScoutingLogs: async (_: unknown, { eventKey, csv }: scoutingLogsArgs) => {
      try {
        await fs.promises.writeFile(filePath, csv);
        await uploadCsvToGraphql(filePath, "http://localhost:4000/graphql", eventKey);
        await createVectorDB();
        console.log("✅ Uploaded:", eventKey);
        return 1;
      } catch (err) {
        console.error("❌ Error in uploadScoutingLogs:", err);
        throw new Error("Failed to upload scouting logs");
      }
    },
    resolveUnmatchedLog: async (
      _: unknown,
      { id, matchNumber, teamNumber }: { id: string; matchNumber: number; teamNumber: number },
    ) => {
      const log = await prisma.unmatchedScoutingLog.findUnique({
        where: { id: parseInt(id) },
      });
      if (!log) throw new Error(`UnmatchedScoutingLog ${id} not found`);

      const match = await prisma.match.findFirst({
        where: { matchNumber, eventKey: log.eventKey },
      });
      if (!match) throw new Error(`Match ${matchNumber} not found in event ${log.eventKey}`);

      const team = await prisma.team.findFirst({
        where: { teamNumber, eventKey: log.eventKey },
      });
      if (!team) throw new Error(`Team ${teamNumber} not found in event ${log.eventKey}`);

      const scoutingData = await prisma.scoutingData.create({
        data: {
          matchId: match.id,
          teamId: team.id,
          eventKey: log.eventKey,
          matchNumber: match.matchNumber,
          teamNumber: team.teamNumber,
          scoutName: log.scoutName,
          autoNotes: log.autoNotes,
          notes: log.notes,
          autoFuel: log.autoFuel,
          teleopFuel: log.teleopFuel,
          missed: log.missed,
          climbLevel: log.climbLevel,
          autoClimb: log.autoClimb,
          penalties: log.penalties,
          totalPoints: log.totalPoints,
          positivityScore: log.positivityScore,
        },
        include: { match: true, team: true, event: true },
      });

      await prisma.unmatchedScoutingLog.delete({ where: { id: parseInt(id) } });
      return scoutingData;
    },
    deleteUnmatchedLog: async (_: unknown, { id }: { id: string }) => {
      await prisma.unmatchedScoutingLog.delete({ where: { id: parseInt(id) } });
      return true;
    },
  },
};
