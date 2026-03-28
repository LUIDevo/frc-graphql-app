export type Team = {
  teamKey: String;
  teamNumber: number;
  nickname: String;
  event: Event;
  matchesPlayed: number;
  matches: [Match];
  wins: number;
  losses: number;
  ties: number;
  rank: number;
  dq: number;
  opr: number;
  dpr: number;
  ccwms: number;
  rankingPoints: number;
  rankingScore: number;
  avgAuto: number;
  avgAutoFuel: number;
  avgTeleopFuel: number;
  avgTotalFuel: number;
  totalClimbL1: number;
  totalClimbL2: number;
  totalClimbL3: number;
  totalClimbFail: number;
  penaltyCount: number;
  endgameReliability: number;
  scoutingCount: number;
  avgPoints: number;
  stdDevPoints: number;
  calculatedEPA: number;
  scoutingData: [ScoutingData];
  upcomingMatches: [Match];
  pastMatches: [Match];
};

export type ScoutingData = {
  match: Match;
  team: Team;
  matchNumber: number;
  teamNumber: number;
  event: Event;
  scoutName: String;
  autoNotes: String;
  notes: String;
  autoFuel: number;
  teleopFuel: number;
  missed: number;
  climbLevel: String;
  autoClimb: boolean;
  penalties: number;
  totalPoints: number;
  positivityScore: number;
};

export type Match = {
  matchKey: String;
  event: Event;
  matchNumber: number;
  redAlliance: [Team];
  blueAlliance: [Team];
  redScore: number;
  blueScore: number;
  scoutingData: [ScoutingData];
  actualTime: Date;
  predictedTime: Date;
  status: String;
};

export type Event = {
  eventKey: string;
  name: string;
  startDate: string;
  endDate: string;
  teams: [Team];
  matches: [Match];
};

export type generateTeam = {
  id: number;
  teamNumber: number;
  wins: number;
  losses: number;
  ties: number;
  rank: number;
  avgAutoFuel: number;
  avgTeleopFuel: number;
  endgameReliability: number;
  avgAuto: number;
  opr: number;
  dpr: number;
};

export type initializeEventArgs = {
  eventKey: string;
};

export type createEventArgs = {
  eventKey: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type scoutingLogsArgs = {
  eventKey: string;
  csv: string;
};

export type CreateTeamArgs = {
  username: number;
  TBA_API_KEY: string;
  GEMINI_API_KEY: string;
};

export interface IngestScoutingDataArgs {
  eventKey: string;
  data: {
    matchNumber: number;
    teamNumber: number;
    scoutName?: string;
    autoNotes?: string;
    notes?: string;
    autoFuel: number;
    teleopFuel: number;
    missed: number;
    climbLevel?: string;
    autoClimb?: boolean;
    penalties: number;
    totalPoints: number;
    positivityScore: number;
  }[];
}

export interface ScoutingDataInputEntry {
  matchNumber: number;
  teamNumber: number;
  scoutName?: string;
  autoNotes?: string;
  notes?: string;
  autoFuel: number;
  teleopFuel: number;
  missed: number;
  climbLevel?: string;
  autoClimb?: boolean;
  penalties: number;
  totalPoints: number;
  positivityScore: number;
}

export interface ScoutingDataInput {
  data: ScoutingDataInputEntry[];
}
