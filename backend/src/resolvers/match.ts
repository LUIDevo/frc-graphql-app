import prisma from "../prisma";
import { PrismaClient } from "@prisma/client";

async function getTBA_API_KEY() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  return user.TBA_API_KEY;
}

export const matchResolvers = {
  Query: {
    getMatchInfo: async (
      _: any,
      args: { eventKey: string; matchKey: string },
      _context: { prisma: PrismaClient },
    ) => {
      const { eventKey, matchKey } = args;
      // TODO: implement match info lookup
    },
    getMatches: async (
      _: any,
      args: { eventKey: string },
      context: { prisma: PrismaClient },
    ) => {
      const { eventKey } = args;

      const matches = await context.prisma.match.findMany({
        where: { eventKey },
        select: {
          matchNumber: true,
          matchKey: true,
          redAlliance: { select: { teamNumber: true } },
          blueAlliance: { select: { teamNumber: true } },
        },
      });

      const scoutCounts = await context.prisma.scoutingData.groupBy({
        by: ["matchNumber"],
        where: { eventKey },
        _count: { matchNumber: true },
      });

      const scoutingNumberData: { [key: number]: number } = {};
      scoutCounts.forEach((s) => {
        scoutingNumberData[s.matchNumber] = s._count.matchNumber;
      });

      return matches.map((m) => ({
        matchNumber: m.matchNumber,
        matchKey: m.matchKey,
        teamNumber: [
          ...m.redAlliance.map((t) => t.teamNumber),
          ...m.blueAlliance.map((t) => t.teamNumber),
        ],
        scoutNumber: scoutingNumberData[m.matchNumber] || 0,
      }));
    },
    getMatchSchedule: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      const matches = await prisma.match.findMany({
        where: { eventKey },
        orderBy: { matchNumber: "asc" },
        include: {
          redAlliance: { select: { teamNumber: true } },
          blueAlliance: { select: { teamNumber: true } },
          scoutingData: { select: { teamNumber: true } },
        },
      });
      return matches;
    },
    getTeamMatches: async (_: any, args: { eventKey: string; teamNumber: number }) => {
      const { eventKey, teamNumber } = args;
      return prisma.match.findMany({
        where: {
          eventKey,
          OR: [
            { redAlliance: { some: { teamNumber, eventKey } } },
            { blueAlliance: { some: { teamNumber, eventKey } } },
          ],
        },
        orderBy: { matchNumber: "asc" },
        include: {
          redAlliance: { select: { teamNumber: true } },
          blueAlliance: { select: { teamNumber: true } },
        },
      });
    },
    getTeamUpcomingMatches: async (_: any, args: { eventKey: string; teamNumber: number; limit?: number }) => {
      const { eventKey, teamNumber, limit = 5 } = args;

      const matches = await prisma.match.findMany({
        where: {
          eventKey,
          status: { not: "completed" },
          OR: [
            { redAlliance: { some: { teamNumber, eventKey } } },
            { blueAlliance: { some: { teamNumber, eventKey } } },
          ],
        },
        orderBy: { matchNumber: "asc" },
        take: limit,
        include: {
          redAlliance: { select: { teamNumber: true, nickname: true, opr: true, rank: true, wins: true, losses: true } },
          blueAlliance: { select: { teamNumber: true, nickname: true, opr: true, rank: true, wins: true, losses: true } },
        },
      });

      return matches.map(match => ({
        matchNumber: match.matchNumber,
        predictedTime: match.predictedTime ?? match.actualTime ?? null,
        redAlliance: match.redAlliance,
        blueAlliance: match.blueAlliance,
        redAllianceOPR: match.redAlliance.reduce((sum, t) => sum + (t.opr ?? 0), 0),
        blueAllianceOPR: match.blueAlliance.reduce((sum, t) => sum + (t.opr ?? 0), 0),
        userOnRed: match.redAlliance.some(t => t.teamNumber === teamNumber),
      }));
    },
    getNextMatch: async (_: any, args: { eventKey: string; teamNumber: number }) => {
      const { eventKey, teamNumber } = args;

      const match = await prisma.match.findFirst({
        where: {
          eventKey,
          status: { not: "completed" },
          OR: [
            { redAlliance: { some: { teamNumber, eventKey } } },
            { blueAlliance: { some: { teamNumber, eventKey } } },
          ],
        },
        orderBy: { matchNumber: "asc" },
        include: {
          redAlliance: { select: { teamNumber: true, nickname: true, opr: true, rank: true, wins: true, losses: true } },
          blueAlliance: { select: { teamNumber: true, nickname: true, opr: true, rank: true, wins: true, losses: true } },
        },
      });

      if (!match) return null;

      const userOnRed = match.redAlliance.some(t => t.teamNumber === teamNumber);
      const redAllianceOPR = match.redAlliance.reduce((sum, t) => sum + (t.opr ?? 0), 0);
      const blueAllianceOPR = match.blueAlliance.reduce((sum, t) => sum + (t.opr ?? 0), 0);

      return {
        matchNumber: match.matchNumber,
        predictedTime: match.predictedTime ?? match.actualTime ?? null,
        redAlliance: match.redAlliance,
        blueAlliance: match.blueAlliance,
        redAllianceOPR,
        blueAllianceOPR,
        userOnRed,
      };
    },
    getEventStats: async (_: any, args: { eventKey: string; teamNumber?: number }) => {
      const { eventKey, teamNumber } = args;

      const [matchCount, matchesPlayed, reportCount, teamsWithReportsRaw, totalTeams] = await Promise.all([
        prisma.match.count({ where: { eventKey } }),
        prisma.match.count({ where: { eventKey, status: "completed" } }),
        prisma.scoutingData.count({ where: { eventKey } }),
        prisma.scoutingData.findMany({
          where: { eventKey },
          select: { teamNumber: true },
          distinct: ["teamNumber"],
        }),
        prisma.team.count({ where: { eventKey } }),
      ]);

      const teamsWithReports = teamsWithReportsRaw.length;
      const teamsWithoutReports = totalTeams - teamsWithReports;

      let nextMatchNumber: number | null = null;
      let nextMatchTime: Date | null = null;

      if (teamNumber != null) {

        const nextMatch = await prisma.match.findFirst({
          where: {
            eventKey,
            status: { not: "completed" },
            OR: [
              { redAlliance: { some: { teamNumber, eventKey } } },
              { blueAlliance: { some: { teamNumber, eventKey } } },
            ],
          },
          orderBy: { matchNumber: "asc" },
          select: { matchNumber: true, predictedTime: true, actualTime: true },
        });

        nextMatchNumber = nextMatch?.matchNumber ?? null;
        nextMatchTime = nextMatch?.predictedTime ?? nextMatch?.actualTime ?? null;
      }

      return { matchCount, teamsWithReports, teamsWithoutReports, reportCount, matchesPlayed, nextMatchNumber, nextMatchTime };
    },
  },
  Mutation: {
    syncMatches: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      try {
        const key = await getTBA_API_KEY();
        const response = await fetch(
          `https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`,
          { headers: { "X-TBA-Auth-Key": key } },
        );
        if (!response.ok) throw new Error(`TBA error: ${response.status}`);
        const matchData = await response.json();
        if (!Array.isArray(matchData)) return false;

        let synced = 0;
        for (const match of matchData) {
          try {
            const redTeamKeys: string[] = match.alliances.red.team_keys;
            const blueTeamKeys: string[] = match.alliances.blue.team_keys;

            const redTeams = await prisma.team.findMany({
              where: { teamKey: { in: redTeamKeys }, eventKey },
              select: { id: true },
            });
            const blueTeams = await prisma.team.findMany({
              where: { teamKey: { in: blueTeamKeys }, eventKey },
              select: { id: true },
            });

            if (redTeams.length === 0 || blueTeams.length === 0) continue;

            const matchFields = {
              redScore: match.alliances.red.score ?? null,
              blueScore: match.alliances.blue.score ?? null,
              actualTime: match.actual_time ? new Date(match.actual_time * 1000) : null,
              predictedTime: match.predicted_time ? new Date(match.predicted_time * 1000) : null,
              status: match.actual_time ? "completed" : "upcoming",
            };

            const existing = await prisma.match.findFirst({
              where: { matchKey: String(match.key) },
            });

            if (existing) {
              await prisma.match.update({
                where: { id: existing.id },
                data: {
                  ...matchFields,
                  redAlliance: { set: redTeams.map((t) => ({ id: t.id })) },
                  blueAlliance: { set: blueTeams.map((t) => ({ id: t.id })) },
                },
              });
            } else {
              await prisma.match.create({
                data: {
                  matchKey: String(match.key),
                  matchNumber: match.match_number,
                  eventKey,
                  ...matchFields,
                  redAlliance: { connect: redTeams.map((t) => ({ id: t.id })) },
                  blueAlliance: { connect: blueTeams.map((t) => ({ id: t.id })) },
                },
              });
            }
            synced++;
          } catch (err) {
            console.error(`Failed to sync match ${match.key}:`, err);
          }
        }
        console.log(`syncMatches: ${synced}/${matchData.length} matches synced`);
        return true;
      } catch (err) {
        console.error("syncMatches failed:", err);
        return false;
      }
    },
  },
};
