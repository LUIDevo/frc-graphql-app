import prisma from "../prisma";
import axios from "axios";
import debug from "debug";
import { createEventArgs, initializeEventArgs } from "../models/types";

const log = debug("app:server");

async function getTBA_API_KEY() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("User not found");
  return user.TBA_API_KEY;
}

export const eventResolvers = {
  Query: {
    getPastEvents: async () => {
      return prisma.event.findMany();
    },
    getNextEvents: async () => {
      const userData = await prisma.user.findFirst();
      if (!userData) throw new Error("No user found");

      const user = "frc" + userData.username;
      const TBA_API_KEY = userData.TBA_API_KEY;
      const response = await fetch(
        `https://www.thebluealliance.com/api/v3/team/${user}/events/2026`,
        { headers: { "X-TBA-Auth-Key": TBA_API_KEY } },
      );
      const data = await response.json();
      console.log(data);
      log(data);
      return data;
    },
    getEvents: async () => {
      return prisma.event.findMany();
    },
  },
  Mutation: {
    addEvent: async (
      _: unknown,
      { eventKey, name, startDate, endDate }: createEventArgs,
    ) => {
      console.log("Args received", { eventKey, name, startDate, endDate });
      try {
        const existing = await prisma.event.findUnique({ where: { eventKey } });
        if (existing) {
          return { eventKey: existing.eventKey, name: existing.name, startDate: existing.startDate };
        }
        const event = await prisma.event.create({
          data: {
            eventKey,
            name,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
          },
        });
        console.log("Event created with name:", name);
        return { eventKey: event.eventKey, name: event.name, startDate: event.startDate };
      } catch (err) {
        console.error("Error creating event:", err);
        log(err);
        throw new Error("Event creation failed: " + err);
      }
    },
    initializeEvent: async (_: unknown, { eventKey }: initializeEventArgs) => {
      console.log("INITIALIZING PROGRAM");
      console.log(`Starting initialization for event: ${eventKey}`);
      try {
        const existingTeamsForEvent = await prisma.team.count({
          where: { eventKey },
        });
        if (existingTeamsForEvent !== 0) {
          console.warn(
            `Event ${eventKey} appears to have already been initialized. Skipping re-initialization.`,
          );
          return false;
        }
        console.log(`No existing teams found for event ${eventKey}, proceeding with initialization`);

        const rankingAPIString = `https://www.thebluealliance.com/api/v3/event/${eventKey}/rankings`;
        const key = await getTBA_API_KEY();
        console.log(`Fetching rankings from: ${rankingAPIString}`);

        console.log("Adding 1 second delay to prevent rate limiting...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let response = await fetch(rankingAPIString, {
          headers: { "X-TBA-Auth-Key": key },
        });

        if (!response.ok) {
          throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
        }

        let json = await response.json();

        let teamData: any[];
        const isFutureEvent =
          !json || !json.rankings || !Array.isArray(json.rankings) || json.rankings.length === 0;

        if (isFutureEvent) {
          console.warn(`No rankings for event ${eventKey} (event may not have started). Falling back to /teams endpoint.`);
          const teamsAPIString = `https://www.thebluealliance.com/api/v3/event/${eventKey}/teams`;
          await new Promise((resolve) => setTimeout(resolve, 500));
          const teamsResponse = await fetch(teamsAPIString, {
            headers: { "X-TBA-Auth-Key": key },
          });
          if (!teamsResponse.ok) {
            throw new Error(`TBA API error fetching teams: ${teamsResponse.status} ${teamsResponse.statusText}`);
          }
          const teamsJson = await teamsResponse.json();
          if (!Array.isArray(teamsJson) || teamsJson.length === 0) {
            throw new Error(`No teams found for event ${eventKey}. The event may not exist or team list is unavailable.`);
          }
          teamData = teamsJson.map((t: any) => ({
            team_key: t.key,
            nickname: t.nickname || null,
            rank: null,
            dq: 0,
            record: { wins: 0, losses: 0, ties: 0 },
            matches_played: 0,
            sort_orders: [],
            extra_stats: [],
          }));
        } else {
          teamData = json.rankings;
        }

        console.log(`Found ${teamData.length} teams for event ${eventKey}`);

        let teamsCreated = 0;
        let teamsFailed = 0;
        let matchesCreated = 0;
        console.log("Starting team creation...");
        for (const team of teamData) {
          try {
            await prisma.team.upsert({
              where: {
                teamNumber_eventKey: {
                  teamNumber: parseInt(team.team_key.replace("frc", "")),
                  eventKey,
                },
              },
              update: {
                dq: team.dq,
                rank: team.rank,
                wins: team.record.wins,
                losses: team.record.losses,
                ties: team.record.ties,
                matchesPlayed: team.matches_played,
                avgAuto:
                  Array.isArray(team.sort_orders) && team.sort_orders.length > 4
                    ? team.sort_orders[4]
                    : null,
                rankingPoints: team.extra_stats?.[0] ?? null,
                rankingScore:
                  Array.isArray(team.sort_orders) && team.sort_orders.length > 0
                    ? team.sort_orders[0]
                    : null,
                nickname: team.nickname || null,
              },
              create: {
                teamNumber: parseInt(team.team_key.replace("frc", "")),
                teamKey: team.team_key,
                eventKey,
                dq: team.dq,
                rank: team.rank,
                wins: team.record.wins,
                losses: team.record.losses,
                ties: team.record.ties,
                matchesPlayed: team.matches_played,
                avgAuto:
                  Array.isArray(team.sort_orders) && team.sort_orders.length > 4
                    ? team.sort_orders[4]
                    : null,
                rankingPoints: team.extra_stats?.[0] ?? null,
                rankingScore:
                  Array.isArray(team.sort_orders) && team.sort_orders.length > 0
                    ? team.sort_orders[0]
                    : null,
                nickname: team.nickname || null,
                avgAutoFuel: null,
                avgTeleopFuel: null,
                avgTotalFuel: null,
                totalClimbL1: null,
                totalClimbL2: null,
                totalClimbL3: null,
                totalClimbFail: null,
                penaltyCount: null,
                endgameReliability: null,
                avgPoints: null,
                stdDevPoints: null,
                calculatedEPA: null,
              },
            });
            teamsCreated++;
            if (teamsCreated % 10 === 0) {
              console.log(`Created ${teamsCreated} teams so far...`);
            }
          } catch (err) {
            console.error(`Failed to upsert team ${team.team_key} for event ${eventKey}:`, err);
            teamsFailed++;
          }
        }
        console.log(`Team creation completed: ${teamsCreated} created, ${teamsFailed} failed`);

        // Download team avatars with rate limiting
        console.log("Starting avatar downloads...");
        let avatarsDownloaded = 0;
        for (const team of teamData) {
          const teamNumber = parseInt(team.team_key.replace("frc", ""));
          const imageUrl = `https://www.thebluealliance.com/avatar/2026/frc${teamNumber}.png`;
          try {
            await new Promise((resolve) => setTimeout(resolve, 200));
            const avatarResponse = await axios.get(imageUrl, {
              responseType: "arraybuffer",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
                Referer: "https://www.thebluealliance.com/",
              },
            });
            if (
              avatarResponse.status !== 200 ||
              avatarResponse.headers["content-type"] !== "image/png"
            ) {
              console.warn(`Invalid image for team ${teamNumber}. Skipping.`);
              continue;
            }
            const imageBuffer: Uint8Array = avatarResponse.data;
            await prisma.avatar.upsert({
              where: { teamNumber },
              update: { image: imageBuffer },
              create: { teamNumber, image: imageBuffer },
            });
            avatarsDownloaded++;
          } catch (e) {
            if (teamNumber == 6632) console.log("error here for 6632: ", e);
            continue;
          }
        }
        console.log(`Avatar downloads completed: ${avatarsDownloaded} downloaded`);

        // Fetch matches
        console.log("GETTING TO MATCH CREATION");
        const matchAPIString = `https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`;
        console.log("Adding 1 second delay before fetching matches...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        response = await fetch(matchAPIString, {
          headers: { "X-TBA-Auth-Key": key },
        });

        if (!response.ok) {
          throw new Error(`TBA API error for matches: ${response.status} ${response.statusText}`);
        }

        json = await response.json();
        const matchData = json;

        if (!Array.isArray(matchData)) {
          console.warn(`No matches found for event ${eventKey} or invalid response:`, json);
        } else {
          console.log(`Found ${matchData.length} matches for event ${eventKey}`);
          let matchesFailed = 0;
          for (const match of matchData) {
            try {
              const redTeamKeys = match.alliances.red.team_keys;
              const blueTeamKeys = match.alliances.blue.team_keys;

              const redTeams = await prisma.team.findMany({
                where: { teamKey: { in: redTeamKeys }, eventKey },
                select: { id: true },
              });
              const blueTeams = await prisma.team.findMany({
                where: { teamKey: { in: blueTeamKeys }, eventKey },
                select: { id: true },
              });

              if (redTeams.length === 0 || blueTeams.length === 0) {
                console.warn(`Skipping match ${match.key} - missing teams for alliances`);
                matchesFailed++;
                continue;
              }

              await prisma.match.create({
                data: {
                  matchKey: String(match.key),
                  matchNumber: match.match_number,
                  eventKey,
                  redAlliance: { connect: redTeams.map((team) => ({ id: team.id })) },
                  blueAlliance: { connect: blueTeams.map((team) => ({ id: team.id })) },
                  redScore: match.alliances.red.score ?? null,
                  blueScore: match.alliances.blue.score ?? null,
                  actualTime: match.actual_time ? new Date(match.actual_time * 1000) : null,
                  predictedTime: match.predicted_time ? new Date(match.predicted_time * 1000) : null,
                  status: match.actual_time ? "completed" : "upcoming",
                },
              });
              matchesCreated++;
              if (matchesCreated % 10 === 0) {
                console.log(`Created ${matchesCreated} matches so far...`);
              }
            } catch (err) {
              console.error(`Failed to create match ${match.key} for event ${eventKey}:`, err);
              matchesFailed++;
            }
          }
          console.log(`Match creation completed: ${matchesCreated} created, ${matchesFailed} failed`);
        }

        // Fetch OPR/DPR
        console.log("Fetching OPR/DPR data...");
        const metricAPIString = `https://www.thebluealliance.com/api/v3/event/${eventKey}/oprs`;
        console.log("Adding 1 second delay before fetching metrics...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        response = await fetch(metricAPIString, {
          headers: { "X-TBA-Auth-Key": key },
        });

        if (response.ok) {
          json = await response.json();
          const metricData = json;
          console.log("got here");
          console.log(metricData);

          if (metricData && metricData.oprs) {
            let metricsUpdated = 0;
            for (const teamKeyTBA in metricData.oprs) {
              try {
                await prisma.team.update({
                  where: {
                    teamNumber_eventKey: {
                      teamNumber: parseInt(teamKeyTBA.replace("frc", "")),
                      eventKey,
                    },
                  },
                  data: {
                    opr: metricData.oprs[teamKeyTBA],
                    dpr: metricData.dprs[teamKeyTBA],
                    ccwms: metricData.ccwms[teamKeyTBA],
                  },
                });
                metricsUpdated++;
              } catch (err) {
                console.error(`Error updating metric data for team ${teamKeyTBA} in event ${eventKey}:`, err);
              }
            }
            console.log(`Updated metrics for ${metricsUpdated} teams`);
          }
        } else {
          console.warn(`Failed to get OPR/DPR data for event ${eventKey}: ${response.status}`);
        }

        console.log(`Event ${eventKey} initialization completed successfully`);
        console.log(`Summary: ${teamsCreated} teams, ${matchesCreated || 0} matches, ${avatarsDownloaded} avatars`);
        return true;
      } catch (error) {
        console.error(`Failed to initialize event ${eventKey}:`, error);
        throw new Error(`Event initialization failed: ${error}`);
      }
    },
  },
};
