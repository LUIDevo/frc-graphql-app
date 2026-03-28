import prisma from "../prisma";
import { PrismaClient } from "@prisma/client";

async function getTBA_API_KEY() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  return user.TBA_API_KEY;
}

export const teamResolvers = {
  Team: {
    scoutingDataCount: (
      parent: any,
      _: any,
      context: { prisma: PrismaClient },
    ) => {
      return context.prisma.scoutingData.count({
        where: { teamId: parent.id },
      });
    },
  },
  Query: {
    getTeams: async () => {
      return prisma.team.findMany();
    },
    getAllTeamInfo: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      const teams = await prisma.team.findMany({ where: { eventKey } });
      const results = await Promise.all(
        teams.map(async (team) => {
          const scoutingCount = await prisma.scoutingData.count({
            where: { eventKey, teamId: team.id },
          });
          return { ...team, scoutingCount };
        }),
      );
      return results;
    },
    getTopRankings: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      console.log("got here");
      console.log(eventKey);
      return prisma.team.findMany({
        where: { eventKey },
        orderBy: { rank: "asc" },
        take: 10,
        select: { nickname: true, rankingPoints: true, rank: true, teamNumber: true, ccwms: true },
      });
    },
    getUnderratedTeams: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      const teams = await prisma.team.findMany({
        where: {
          eventKey,
          opr: { not: null },
          rank: { not: null },
          teamNumber: { not: undefined },
        },
        orderBy: [{ opr: "desc" }, { rank: "asc" }],
        take: 30,
        select: {
          teamNumber: true,
          nickname: true,
          opr: true,
          rank: true,
          avgPoints: true,
          calculatedEPA: true,
        },
      });
      return teams.filter((team) => team.rank !== null && team.rank > 15);
    },
    getBestClimbTeams: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      const teams = await prisma.team.findMany({
        where: { eventKey, teamNumber: { not: undefined } },
        orderBy: [{ endgameReliability: "desc" }],
        take: 30,
        select: {
          teamNumber: true,
          nickname: true,
          rank: true,
          totalClimbL1: true,
          totalClimbL2: true,
          totalClimbL3: true,
          endgameReliability: true,
          calculatedEPA: true,
        },
      });
      return teams.filter((team) => team.rank !== null);
    },
    getTopScoringHypotheticalAllianceScore: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      console.log("got here");
      return prisma.team.findMany({
        where: { eventKey },
        orderBy: { opr: "desc" },
        take: 3,
        select: { opr: true },
      });
    },
    getTopDefensiveHypotheticalAllianceScore: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      console.log("got here");
      return prisma.team.findMany({
        where: { eventKey },
        orderBy: { dpr: "desc" },
        take: 3,
        select: { dpr: true },
      });
    },
  },
  Mutation: {
    syncTeams: async (_: any, args: { eventKey: string }) => {
      const { eventKey } = args;
      try {
        const key = await getTBA_API_KEY();
        const headers = { "X-TBA-Auth-Key": key };

        const [rankingsRes, oprsRes] = await Promise.all([
          fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/rankings`, { headers }),
          fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/oprs`, { headers }),
        ]);

        const oprs: { oprs: Record<string, number>; dprs: Record<string, number>; ccwms: Record<string, number> } =
          oprsRes.ok ? await oprsRes.json() : { oprs: {}, dprs: {}, ccwms: {} };

        if (!rankingsRes.ok) {
          console.error(`TBA rankings error: ${rankingsRes.status}`);
          return false;
        }

        const rankingsData = await rankingsRes.json();
        const rankings: any[] = rankingsData?.rankings ?? [];

        let updated = 0;
        for (const entry of rankings) {
          const teamKey: string = entry.team_key;
          const teamNumber = parseInt(teamKey.replace("frc", ""), 10);
          const record = entry.record ?? {};

          try {
            await prisma.team.updateMany({
              where: { teamNumber, eventKey },
              data: {
                rank: entry.rank ?? null,
                wins: record.wins ?? null,
                losses: record.losses ?? null,
                ties: record.ties ?? null,
                dq: entry.dq ?? null,
                matchesPlayed: entry.matches_played ?? null,
                rankingScore: entry.ranking_score ?? null,
                rankingPoints: entry.extra_stats?.[0] != null ? Math.round(entry.extra_stats[0]) : null,
                opr: oprs.oprs[teamKey] ?? null,
                dpr: oprs.dprs[teamKey] ?? null,
                ccwms: oprs.ccwms[teamKey] ?? null,
              },
            });
            updated++;
          } catch (err) {
            console.error(`Failed to sync team ${teamKey}:`, err);
          }
        }

        console.log(`syncTeams: updated ${updated}/${rankings.length} teams`);
        return true;
      } catch (err) {
        console.error("syncTeams failed:", err);
        return false;
      }
    },
  },
};
