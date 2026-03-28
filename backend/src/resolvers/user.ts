import prisma from "../prisma";
import debug from "debug";
import { PrismaClient } from "@prisma/client";
import { CreateTeamArgs } from "../models/types";

const log = debug("app:server");

export const userResolvers = {
  Query: {
    findUser: async () => {
      return prisma.user.count();
    },
    user: async () => {
      console.log("Got here");
      return prisma.user.findFirst();
    },
		userInfo: async (_: unknown, { eventKey, userNumber }: { eventKey: string; userNumber: number }) => {
			return prisma.team.findFirst({ where: { eventKey: eventKey, teamNumber: userNumber } })
		}
  },
  Mutation: {
    clearDB: async () => {
      try {
        await prisma.user.deleteMany();
        log("Succesufully deleted User Table ");
        return true;
      } catch (err) {
        console.log("Error deleting User Table" + err);
        return false;
      }
    },
    addUser: async (
      _: unknown,
      { username, TBA_API_KEY, GEMINI_API_KEY }: CreateTeamArgs,
    ) => {
      log("Received addUser mutation");
      console.log("here");
      // console.log(
      //   "[GraphQL] addUser pinged with:",
      //   username,
      //   TBA_API_KEY,
      //   GEMINI_API_KEY,
      // );
      const createdAt = new Date().toISOString();
      const usernameStr = String(username);

      // console.log("With values:", [usernameStr, TBA_API_KEY, GEMINI_API_KEY, createdAt]);
      try {
        const user = await prisma.user.create({
          data: {
            username: usernameStr,
            TBA_API_KEY: TBA_API_KEY,
            GEMINI_API_KEY,
            createdAt: new Date(),
          },
        });
        log("Creating team with ", usernameStr);
        return {
          id: user.id,
          username: user.username,
          TBA_API_KEY: user.TBA_API_KEY,
        };
      } catch (error) {
        console.error("Error during database operation:", error);
        log("Error during addUser mutation: ", error);
        throw new Error("Error creating team: " + error);
      }
    },
  },
};
