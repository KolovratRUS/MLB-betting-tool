/**
 * MLB StatsAPI client for fetching real-time MLB game data
 */

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

export interface MLBGame {
  gamePk: string | number;
  teams: {
    away: {
      team: {
        id?: number;
        name: string;
      };
      probablePitcher?: {
        id?: number;
        fullName?: string;
      };
    };
    home: {
      team: {
        id?: number;
        name: string;
      };
      probablePitcher?: {
        id?: number;
        fullName?: string;
      };
    };
  };
  gameDate: string;
  status?: {
    abstractGameState: string;
  };
}

export interface MLBScheduleResponse {
  dates?: Array<{
    games: MLBGame[];
  }>;
}

export interface MLBTeamSeasonStats {
  id: number;
  name: string;
  record: {
    wins: number;
    losses: number;
    gamesPlayed: number;
  };
}

export interface MLBGameResult {
  gamePk: number;
  gameDate: string;
  teams: {
    away: {
      team: { id: number; name: string };
      score: number;
    };
    home: {
      team: { id: number; name: string };
      score: number;
    };
  };
}

/**
 * Fetch today's MLB schedule with probable pitchers
 * @param dateStr Optional date in YYYY-MM-DD format, defaults to today
 * @returns Array of games for the specified date
 */
export async function getSchedule(dateStr?: string): Promise<MLBGame[]> {
  try {
    // Use provided date or today's date
    const date = dateStr || new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `${MLB_API_BASE}/schedule?sportId=1&date=${date}&hydrate=probablePitcher`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error(`MLB API error: ${response.status}`);
      return [];
    }

    const data: MLBScheduleResponse = await response.json();
    
    if (!data.dates || data.dates.length === 0) {
      console.log(`No games found for ${date}`);
      return [];
    }

    // Filter out games that haven't started yet or are already completed
    // For now, return all games from the schedule
    return data.dates[0].games || [];
  } catch (error) {
    console.error('Error fetching MLB schedule:', error);
    return [];
  }
}

/**
 * Fetch team season-to-date statistics
 * @param teamId MLB team ID
 * @returns Team season stats
 */
export async function getTeamSeasonStats(teamId: number): Promise<MLBTeamSeasonStats | null> {
  try {
    const response = await fetch(
      `${MLB_API_BASE}/teams/${teamId}?hydrate=record`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error(`[MLB API] Error fetching team stats for ${teamId}: ${response.status}`);
      return null;
    }

    const data: { teams: MLBTeamSeasonStats[] } = await response.json();
    return data.teams?.[0] || null;
  } catch (error) {
    console.error(`[MLB API] Error fetching team stats for ${teamId}:`, error);
    return null;
  }
}

/**
 * Fetch team game-by-game results for the current season
 * Uses the schedule endpoint filtered by teamId
 * @param teamId MLB team ID
 * @param season Season year (defaults to current year)
 * @returns Array of game results
 */
export async function getTeamGameResults(teamId: number, season?: number): Promise<MLBGameResult[]> {
  try {
    // Determine season - use provided or calculate current
    const targetSeason = season || new Date().getFullYear();
    
    const url = new URL(`${MLB_API_BASE}/schedule`);
    url.searchParams.append('sportId', '1');
    url.searchParams.append('teamId', String(teamId));
    url.searchParams.append('season', String(targetSeason));
    
    console.log(`[MLB API] Fetching games for team ${teamId}, season ${targetSeason}`);
    console.log(`[MLB API] URL: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`[MLB API] Error fetching games for team ${teamId}: ${response.status}`);
      return [];
    }

    const data: any = await response.json();
    
    // Extract games from schedule response structure
    const games: MLBGameResult[] = [];
    if (data.dates && Array.isArray(data.dates)) {
      data.dates.forEach((dateGroup: any) => {
        if (dateGroup.games && Array.isArray(dateGroup.games)) {
          games.push(...dateGroup.games);
        }
      });
    }
    
    console.log(`[MLB API] Found ${games.length} games for team ${teamId} in season ${targetSeason}`);
    return games;
  } catch (error) {
    console.error(`[MLB API] Error fetching games for team ${teamId}:`, error);
    return [];
  }
}

/**
 * Get all MLB teams with their IDs
 * @returns Map of team names to team IDs
 */
export async function getAllTeams(): Promise<Map<string, number>> {
  try {
    const response = await fetch(
      `${MLB_API_BASE}/teams`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) {
      console.error(`[MLB API] Error fetching teams: ${response.status}`);
      return new Map();
    }

    const data: { teams: Array<{ id: number; name: string }> } = await response.json();
    const teamMap = new Map<string, number>();
    
    data.teams?.forEach((team) => {
      // Store by both full name and abbreviations for matching flexibility
      teamMap.set(team.name.toLowerCase(), team.id);
    });
    
    return teamMap;
  } catch (error) {
    console.error('[MLB API] Error fetching teams:', error);
    return new Map();
  }
}


/**
 * Get team ID by team name
 * @param teamName Team name to look up
 * @returns Team ID or null if not found
 */
export async function getTeamIdByName(teamName: string): Promise<number | null> {
  const teamMap = await getAllTeams();
  return teamMap.get(teamName.toLowerCase()) || null;
}
