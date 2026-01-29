export interface NhlTeamResponse {
  id: number;
  franchiseId: number | null;
  fullName: string;
  triCode: string;
}

export interface NhlTeamsApiResponse {
  data: NhlTeamResponse[];
  total: number;
}
