import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date
  scalar JSON
  scalar Upload

  type Avatar {
    teamNumber: Int!
    image: String
  }

  type GetMatches {
    matchNumber: Int!
    matchKey: String!
    teamNumber: [Int]!
    scoutNumber: Int!
  }

  type MatchTeamDetail {
    teamNumber: Int!
    nickname: String
    opr: Float
    rank: Int
    wins: Int
    losses: Int
  }

  type NextMatchInfo {
    matchNumber: Int!
    predictedTime: Date
    redAlliance: [MatchTeamDetail!]!
    blueAlliance: [MatchTeamDetail!]!
    redAllianceOPR: Float
    blueAllianceOPR: Float
    userOnRed: Boolean!
  }

  type EventStats {
    matchCount: Int!
    teamsWithReports: Int!
    teamsWithoutReports: Int!
    reportCount: Int!
    matchesPlayed: Int!
    nextMatchNumber: Int
    nextMatchTime: Date
  }

  type User {
    id: ID!
    username: String!
    createdAt: Date!
    TBA_API_KEY: String!
    GEMINI_API_KEY: String!
  }

  type Event {
    id: ID!
    eventKey: String!
    name: String!
    startDate: String!
    endDate: String!
    teams: [Team!]!
    matches: [Match!]!
  }

  type Team {
    id: ID!
    teamKey: String!
    teamNumber: Int!
    nickname: String
    event: Event!
    matchesPlayed: Int
    matches: [Match]
    wins: Int
    losses: Int
    ties: Int
    rank: Int
    dq: Int
    opr: Float
    dpr: Float
    ccwms: Float
    rankingPoints: Int
    rankingScore: Float
    avgAuto: Float
    avgAutoFuel: Float
    avgTeleopFuel: Float
    avgTotalFuel: Float
    totalClimbL1: Float
    totalClimbL2: Float
    totalClimbL3: Float
    totalClimbFail: Float
    penaltyCount: Int
    endgameReliability: Float
    scoutingCount: Int
    avgPoints: Float
    stdDevPoints: Float
    calculatedEPA: Float
    scoutingData: [ScoutingData!]
    upcomingMatches: [Match!]
    pastMatches: [Match!]

    scoutingDataCount: Int!
  }

  type Match {
    id: ID!
    matchKey: String!
    event: Event!
    matchNumber: Int!
    redAlliance: [Team!]!
    blueAlliance: [Team!]!
    redScore: Int!
    blueScore: Int!
    scoutingData: [ScoutingData]
    actualTime: Date
    predictedTime: Date
    status: String
  }

  type ScoutingData {
    id: ID!
    match: Match!
    team: Team!
    matchNumber: Int!
    teamNumber: Int!
    event: Event!
    scoutName: String
    autoNotes: String
    notes: String
    autoFuel: Int
    teleopFuel: Int
    missed: Int
    climbLevel: String
    autoClimb: Boolean
    penalties: Int
    totalPoints: Int
    positivityScore: Float
  }

  input ScoutingDataInput {
    matchNumber: Int!
    teamNumber: Int!
    scoutName: String
    autoNotes: String
    notes: String
    autoFuel: Int
    teleopFuel: Int
    missed: Int
    climbLevel: String
    autoClimb: Boolean
    penalties: Int
    totalPoints: Int
    positivityScore: Float
  }

  type UploadResult {
    success: Boolean!
    message: String!
    uploadedCount: Int!
  }

  type UnmatchedScoutingLog {
    id: ID!
    eventKey: String!
    matchNumber: Int!
    teamNumber: Int!
    scoutName: String
    autoNotes: String
    notes: String
    autoFuel: Int
    teleopFuel: Int
    missed: Int
    climbLevel: String
    autoClimb: Boolean
    penalties: Int
    totalPoints: Int
    positivityScore: Float
    reason: String
    createdAt: String!
  }

  input generateTeam {
    teamNumber: Int!
    avgAutoFuel: Float!
    avgTeleopFuel: Float!
    endgameReliability: Float!
    avgAuto: Float!
  }

  type Query {
    user: User
    userInfo(eventKey: String!, userNumber: Int!): Team
    team(id: ID!): Team
    event(id: ID!): Event
    match(id: ID!): Match
    findUser: JSON
    getNextEvents: JSON
    getTeams: [Team]
    getEvents: [Event]
    getTopRankings(eventKey: String!): [Team!]
    getAllTeamInfo(eventKey: String!): [Team!]
    getMatches(eventKey: String): [GetMatches]
    getTopScoringHypotheticalAllianceScore(eventKey: String!): [Team!]
    getTopDefensiveHypotheticalAllianceScore(eventKey: String!): [Team!]
    getUnderratedTeams(eventKey: String!): [Team!]
    getBestClimbTeams(eventKey: String!): [Team!]
    scoutingData(id: ID!): ScoutingData
    getMatchInfo(eventKey: String!, matchKey: String!): JSON
    getMatchSchedule(eventKey: String!): JSON
    getEventStats(eventKey: String!, teamNumber: Int): EventStats!
    getNextMatch(eventKey: String!, teamNumber: Int!): NextMatchInfo
    getTeamUpcomingMatches(eventKey: String!, teamNumber: Int!, limit: Int): [NextMatchInfo!]!
    getPastEvents: [Event]
    getSimilarTeams(eventKey: String!, teamNumber: Int!): [Team!]
    getTeamScoutingData(eventKey: String!, teamNumber: Int!): [ScoutingData!]!
    getTeamMatches(eventKey: String!, teamNumber: Int!): [Match!]!
    getUnmatchedLogs(eventKey: String!): [UnmatchedScoutingLog!]!
    generateGamePlan(
      eventKey: String!
      allianceOne: [generateTeam]
      allianceTwo: [generateTeam]
    ): JSON
  }

  type Mutation {
    addUser(
      username: String!
      TBA_API_KEY: String!
      GEMINI_API_KEY: String
    ): User!
    addEvent(
      eventKey: String!
      name: String!
      startDate: String!
      endDate: String!
    ): Event!
    addTeam(teamKey: String!, teamNumber: Int!, eventId: ID!): Team!
    clearDB: Boolean!
    uploadScoutingLogs(eventKey: String!, csv: String!): Int!
    ingestScoutingData(
      eventKey: String!
      data: [ScoutingDataInput!]!
    ): UploadResult!
    initializeEvent(eventKey: String!): Boolean!
    addMatch(matchKey: String!, matchNumber: Int!, eventId: ID!): Match!
    addScoutingData(
      matchId: ID!
      teamId: ID!
      eventId: ID!
      scoutName: String
      autoNotes: String
      notes: String
      autoFuel: Int
      teleopFuel: Int
      missed: Int
      climbLevel: String
      autoClimb: Boolean
      penalties: Int
      totalPoints: Int
    ): ScoutingData!
    resolveUnmatchedLog(
      id: ID!
      matchNumber: Int!
      teamNumber: Int!
    ): ScoutingData!
    deleteUnmatchedLog(id: ID!): Boolean!
    syncMatches(eventKey: String!): Boolean!
    syncTeams(eventKey: String!): Boolean!
  }
`;
