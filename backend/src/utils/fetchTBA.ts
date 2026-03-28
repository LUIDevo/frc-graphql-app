import fetch from "node-fetch";

const TBA_BASE_URL = "https://www.thebluealliance.com/api/v3";

export async function fetchTeamDataFromTBA(teamNumber: string, apiKey: string) {
  const response = await fetch(`${TBA_BASE_URL}/team/frc${teamNumber}`, {
    headers: {
      "X-TBA-Auth-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch team data");
  }

  return response.json();
}
