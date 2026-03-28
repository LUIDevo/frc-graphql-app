import { userResolvers } from "./user";
import { eventResolvers } from "./event";
import { teamResolvers } from "./team";
import { matchResolvers } from "./match";
import { scoutingResolvers } from "./scouting";
import { analyticsResolvers } from "./analytics";

export const resolvers = {
  Team: {
    ...teamResolvers.Team,
  },
  Query: {
    ...userResolvers.Query,
    ...eventResolvers.Query,
    ...teamResolvers.Query,
    ...matchResolvers.Query,
    ...scoutingResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...teamResolvers.Mutation,
    ...matchResolvers.Mutation,
    ...scoutingResolvers.Mutation,
  },
};
