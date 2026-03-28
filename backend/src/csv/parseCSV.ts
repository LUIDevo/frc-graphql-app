import fs from "fs";
import csv from "csv-parser";
import { GraphQLClient, gql, ClientError } from "graphql-request";
import { getPositivityScore } from "./positivityScore";

interface CsvMatchRow {
  matchNumber: string;
  TeamNumber: string;
  scoutId: string;
  teamPosition: string;
  teamColour: string;
  AutoFuel: string;
  TeleopFuel: string;
  NumberOfMissed: string;
  ClimbLevel: string;
  AutoClimb: string;
  Penalty: string;
  Comments: string;
  "Auto Comments": string;
}

interface ScoutingDataInput {
  matchNumber: number;
  teamNumber: number;
  scoutName: string | null;
  autoNotes: string | null;
  notes: string | null;
  autoFuel: number;
  teleopFuel: number;
  missed: number;
  climbLevel: string | null;
  autoClimb: boolean;
  penalties: number;
  totalPoints: number;
  positivityScore: number;
}

const UPLOAD_SCOUTING_DATA_MUTATION = gql`
  mutation ingestScoutingData(
    $eventKey: String!
    $data: [ScoutingDataInput!]!
  ) {
    ingestScoutingData(eventKey: $eventKey, data: $data) {
      success
      message
      uploadedCount
    }
  }
`;

export async function uploadCsvToGraphql(
  csvFilePath: string,
  graphqlEndpoint: string,
  eventKey: string,
): Promise<void> {
  const scoutingDataInputs: ScoutingDataInput[] = [];
  let rowCount = 0;

  try {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row: CsvMatchRow) => {
          rowCount++;

          const autoFuel = parseInt(row.AutoFuel) || 0;
          const teleopFuel = parseInt(row.TeleopFuel) || 0;
          const climbLevel = row.ClimbLevel?.toLowerCase() || "none";
          const autoClimb =
            row.AutoClimb?.toLowerCase() === "true" ||
            row.AutoClimb === "1" ||
            row.AutoClimb?.toLowerCase() === "yes";

          const climbPoints =
            climbLevel === "level1"
              ? 10
              : climbLevel === "level2"
                ? 20
                : climbLevel === "level3"
                  ? 30
                  : 0;

          const scoutingDataInput: ScoutingDataInput = {
            matchNumber: parseInt(row.matchNumber) || 0,
            teamNumber: parseInt(row.TeamNumber) || 0,
            scoutName: row.scoutId || null,
            autoNotes: row["Auto Comments"] || null,
            notes: row.Comments || null,
            autoFuel,
            teleopFuel,
            missed: parseInt(row.NumberOfMissed) || 0,
            climbLevel: climbLevel || null,
            autoClimb,
            penalties: parseInt(row.Penalty) || 0,
            totalPoints: autoFuel + teleopFuel + climbPoints,
            positivityScore: getPositivityScore(row.Comments || ""),
          };

          scoutingDataInputs.push(scoutingDataInput);
        })
        .on("end", () => {
          console.info(`Finished parsing CSV. Total rows: ${rowCount}`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error while parsing CSV at row ${rowCount}:`, err);
          reject(err);
        });
    });

    const filteredData = scoutingDataInputs.filter(
      (entry) => entry.matchNumber > 0 && entry.teamNumber > 0,
    );

    if (filteredData.length === 0) {
      console.warn("No valid data found to upload after filtering.");
      return;
    }

    console.info(
      `Uploading ${filteredData.length} entries to GraphQL endpoint: ${graphqlEndpoint}`,
    );

    const BATCH_SIZE = 50;
    let totalUploaded = 0;
    let totalErrors = 0;

    const client = new GraphQLClient(graphqlEndpoint);

    for (let i = 0; i < filteredData.length; i += BATCH_SIZE) {
      const batch = filteredData.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(filteredData.length / BATCH_SIZE)} (${batch.length} entries)`,
      );

      console.log("Validating batch data structure...");
      for (let j = 0; j < batch.length; j++) {
        const entry = batch[j];
        if (
          typeof entry.matchNumber !== "number" ||
          typeof entry.teamNumber !== "number"
        ) {
          console.error(`Invalid entry at index ${i + j}:`, entry);
          throw new Error(`Invalid data structure at index ${i + j}`);
        }

        if (entry.matchNumber <= 0 || entry.teamNumber <= 0) {
          console.error(
            `Invalid matchNumber or teamNumber at index ${i + j}:`,
            entry,
          );
          throw new Error(
            `Invalid matchNumber or teamNumber at index ${i + j}`,
          );
        }

        const numericFields = [
          "autoFuel",
          "teleopFuel",
          "missed",
          "penalties",
          "totalPoints",
          "positivityScore",
        ];
        for (const field of numericFields) {
          if (typeof entry[field as keyof ScoutingDataInput] !== "number") {
            console.error(
              `Invalid ${field} at index ${i + j}:`,
              entry[field as keyof ScoutingDataInput],
            );
            throw new Error(`Invalid ${field} at index ${i + j}`);
          }
        }
      }
      console.log("Batch validation passed!");

      const variables = { eventKey, data: batch };

      try {
        console.log(
          `Sending batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} entries...`,
        );
        const response = await client.request(
          UPLOAD_SCOUTING_DATA_MUTATION,
          variables,
        );
        console.info(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1} upload response:`,
          response,
        );
        totalUploaded += batch.length;
      } catch (uploadError: unknown) {
        console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} upload failed!`);
        if (uploadError instanceof ClientError) {
          console.error("GraphQL ClientError:");
          console.error("HTTP status:", uploadError.response.status);
          console.error(
            "GraphQL errors:",
            JSON.stringify(uploadError.response.errors, null, 2),
          );
          console.error(
            "Partial response data:",
            JSON.stringify(uploadError.response.data, null, 2),
          );
          console.error(
            "Request variables:",
            JSON.stringify(variables, null, 2),
          );
        } else {
          console.error("Unexpected upload error:", uploadError);
        }
        totalErrors += batch.length;
        console.error(
          `Skipping batch ${Math.floor(i / BATCH_SIZE) + 1} due to error`,
        );
      }
    }

    console.log(
      `Upload completed. Total uploaded: ${totalUploaded}, Total errors: ${totalErrors}`,
    );

    if (totalErrors > 0) {
      console.warn(
        `Upload completed with ${totalErrors} errors out of ${filteredData.length} total entries`,
      );
      console.warn(
        `Success rate: ${((totalUploaded / filteredData.length) * 100).toFixed(1)}%`,
      );
    } else {
      console.log("All entries uploaded successfully!");
    }
  } catch (error) {
    console.error("Upload process failed:", error);
    throw error;
  }
}
