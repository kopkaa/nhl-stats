import { NhlLocalizedString } from '../common';

export interface NhlRosterPlayer {
  id: number;
  headshot: string;
  firstName: NhlLocalizedString;
  lastName: NhlLocalizedString;
  sweaterNumber: number;
  positionCode: string;
  shootsCatches: string;
  heightInCentimeters: number;
  weightInKilograms: number;
  birthDate: string;
  birthCountry: string;
  birthCity: NhlLocalizedString;
  birthStateProvince?: NhlLocalizedString;
}

export interface NhlRosterResponse {
  forwards: NhlRosterPlayer[];
  defensemen: NhlRosterPlayer[];
  goalies: NhlRosterPlayer[];
}

export interface NhlSkaterStats {
  playerId: number;
  headshot: string;
  firstName: NhlLocalizedString;
  lastName: NhlLocalizedString;
  positionCode: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  powerPlayGoals: number;
  shorthandedGoals: number;
  gameWinningGoals: number;
  overtimeGoals: number;
  shots: number;
  shootingPctg: number;
  avgTimeOnIcePerGame: number;
  avgShiftsPerGame: number;
  faceoffWinPctg: number;
}

export interface NhlGoalieStats {
  playerId: number;
  headshot: string;
  firstName: NhlLocalizedString;
  lastName: NhlLocalizedString;
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  goalsAgainstAverage: number;
  savePercentage: number;
  shutouts: number;
  shotsAgainst: number;
  saves: number;
  goalsAgainst: number;
}

export interface NhlClubStatsResponse {
  season: number;
  gameType: number;
  skaters: NhlSkaterStats[];
  goalies: NhlGoalieStats[];
}
