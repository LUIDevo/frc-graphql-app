import { PrismaClient } from "@prisma/client";
import { getClosestTeamVectors } from "../utils/addVectors";
import { GoogleGenAI } from "@google/genai";

export const analyticsResolvers = {
  Query: {
    generateGamePlan: async (
      _: any,
      { eventKey, allianceOne, allianceTwo }: any,
      context: { prisma: PrismaClient },
    ) => {
      console.log(">>> generateGamePlan called");
      if (
        !eventKey ||
        !allianceOne[0] || !allianceOne[1] || !allianceOne[2] ||
        !allianceTwo[0] || !allianceTwo[1] || !allianceTwo[2]
      ) {
        console.log("her:");
        return "no";
      }

      const teamOneInfo = {
        teamNumber: allianceOne[0].teamNumber,
        autoFuel: allianceOne[0].avgAutoFuel,
        teleopFuel: allianceOne[0].avgTeleopFuel,
        endgame: allianceOne[0].endgameReliability,
        auto: allianceOne[0].avgAuto,
      };
      const teamTwoInfo = {
        teamNumber: allianceOne[1].teamNumber,
        autoFuel: allianceOne[1].avgAutoFuel,
        teleopFuel: allianceOne[1].avgTeleopFuel,
        endgame: allianceOne[1].endgameReliability,
        auto: allianceOne[1].avgAuto,
      };
      const teamThreeInfo = {
        teamNumber: allianceOne[2].teamNumber,
        autoFuel: allianceOne[2].avgAutoFuel,
        teleopFuel: allianceOne[2].avgTeleopFuel,
        endgame: allianceOne[2].endgameReliability,
        auto: allianceOne[2].avgAuto,
      };
      const teamFourInfo = {
        teamNumber: allianceTwo[0].teamNumber,
        autoFuel: allianceTwo[0].avgAutoFuel,
        teleopFuel: allianceTwo[0].avgTeleopFuel,
        endgame: allianceTwo[0].endgameReliability,
        auto: allianceTwo[0].avgAuto,
      };
      const teamFiveInfo = {
        teamNumber: allianceTwo[1].teamNumber,
        autoFuel: allianceTwo[1].avgAutoFuel,
        teleopFuel: allianceTwo[1].avgTeleopFuel,
        endgame: allianceTwo[1].endgameReliability,
        auto: allianceTwo[1].avgAuto,
      };
      const teamSixInfo = {
        teamNumber: allianceTwo[2].teamNumber,
        autoFuel: allianceTwo[2].avgAutoFuel,
        teleopFuel: allianceTwo[2].avgTeleopFuel,
        endgame: allianceTwo[2].endgameReliability,
        auto: allianceTwo[2].avgAuto,
      };

      const teamNumbers = [
        teamOneInfo.teamNumber,
        teamTwoInfo.teamNumber,
        teamThreeInfo.teamNumber,
        teamFourInfo.teamNumber,
        teamFiveInfo.teamNumber,
        teamSixInfo.teamNumber,
      ];

      const collectiveScoutingData: Record<number, string[]> = {};
      for (const team of teamNumbers) {
        const scoutingData = await context.prisma.scoutingData.findMany({
          where: { teamNumber: team, eventKey },
        });
        collectiveScoutingData[team] = scoutingData
          .map((data) => data.notes)
          .filter((note): note is string => note !== null);
      }

      console.log(`IMPORTANT INFO ${teamOneInfo.teamNumber}`);

      const explanationString = `You are a strategist for the 2026 First Robotics Competition game: REBUILT.

Your alliance is composed of teams ${teamOneInfo.teamNumber}, ${teamTwoInfo.teamNumber}, and ${teamThreeInfo.teamNumber}.
The opposing alliance is made up of teams ${teamFourInfo.teamNumber}, ${teamFiveInfo.teamNumber}, and ${teamSixInfo.teamNumber}.

### Game Overview (REBUILT):
- Teams score **FUEL** (foam balls) in their **HUB**: 1 pt each (auto or teleop)
- **Tower climbing** at endgame:
  - Level 1: 10 pts | Level 2: 20 pts | Level 3: 30 pts
  - In auto, Level 1 climb is worth 15 pts (max 2 robots per alliance)
- **Ranking Points:**
  - Energized RP: alliance scores ≥100 FUEL in HUB
  - Supercharged RP: alliance scores ≥360 FUEL in HUB
  - Traversal RP: alliance tower points ≥50
- Defense is effective at disrupting fuel intake and HUB scoring
- Strong alliances typically run 2 high-volume fuel scorers and 1 dedicated climber/defender

### Your Mission:
Given the scouting data below:
\`\`\`json
${JSON.stringify(collectiveScoutingData, null, 2)}
\`\`\`

Determine:
1. The likely formation/roles of the **opposing alliance**
2. The **best strategic roles** for our teams
3. An overall **match strategy** that counters their plan and maximizes our score

### Output Instructions:
- First: summarize the **opposing alliance's likely roles**
- Then: describe **our alliance's role assignments and strategy**
- **Be concise.** Prioritize relevance over wordiness.
- Keep formatting plain — no tables or fancy visuals.
- Include **each team number with this format** when referencing:
  \`<img style="width: 1.25rem; height: 1.25rem; border-radius: 100px; vertical-align: middle; display: inline-block; transform: scale(0.85);" src="http://localhost:4000/avatar/TEAMNUMBER" alt="Team Avatar" /> BOLDTEAMNUMBER\`
  If a team is on our alliance, make the text #3CC262, if not then #FF2D56

Again, your alliance is ${teamOneInfo.teamNumber}, ${teamTwoInfo.teamNumber}, ${teamThreeInfo.teamNumber},
Their alliance is ${teamFourInfo.teamNumber}, ${teamFiveInfo.teamNumber}, ${teamSixInfo.teamNumber}.

Be strategic. Keep it brief. Good luck!`;

      console.log(explanationString);
      const user = await context.prisma.user.findFirst();
      const GEMINI_API_KEY = user?.GEMINI_API_KEY;

      if (GEMINI_API_KEY) {
        console.log(">> THINKING...");
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: explanationString,
        });
        console.log(response.text);
        return response.text;
      } else {
        console.log(">> NO AI");
        return "";
      }
    },

    getSimilarTeams: async (
      _: any,
      args: { eventKey: string; teamNumber: number },
      context: { prisma: PrismaClient },
    ) => {
      const { eventKey, teamNumber } = args;
      const vectraResults = await getClosestTeamVectors(teamNumber, eventKey);
      const similarTeams = await Promise.all(
        vectraResults.map(async (result) => {
          const { teamNumber: tNum, eventKey: eKey } = result.item.metadata;
          console.log(`Looking up team ${tNum} at event ${eKey}`);
          return await context.prisma.team.findFirst({
            where: { teamNumber: tNum, eventKey: eKey },
          });
        }),
      );
      console.log(similarTeams, "hi");
      return similarTeams.filter((team) => team !== null);
    },
  },
};
