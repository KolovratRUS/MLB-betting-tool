/**
 * MLB StatsAPI client for fetching real-time MLB game data
 */

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

/**
 * Get "today's" date as YYYY-MM-DD in U.S. Eastern Time (America/New_York).
 *
 * MLB and U.S. sportsbooks roll their daily slate on Eastern Time, so the
 * schedule day MUST be derived from Eastern — never from UTC or the host's
 * local timezone. Using `new Date().toISOString()` (UTC) would request the
 * wrong day for the ~8pm-midnight ET window (when UTC has already rolled to
 * the next calendar day), which is the source of "showing the wrong day".
 *
 * `Intl.DateTimeFormat('en-CA', ...)` emits an ISO-style `YYYY-MM-DD` string,
 * and pinning `timeZone: 'America/New_York'` makes the result independent of
 * the user's location, the local machine TZ, and the Vercel server/region TZ.
 */
export function getEasternDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

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
    // Use provided date or today's date in U.S. Eastern Time (MLB's schedule day).
    const date = dateStr || getEasternDate();

    console.log(`[MLB API] Requesting schedule for date=${date} (America/New_York)`);

    // Never cache the schedule fetch: the daily slate must reflect the current
    // Eastern day on every request, so we opt out of Next's Data Cache (no
    // stale-while-revalidate) rather than serving a previously-fetched day.
    const response = await fetch(
      `${MLB_API_BASE}/schedule?sportId=1&date=${date}&hydrate=probablePitcher`,
      { cache: 'no-store' }
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
 * Parse an ERA value from the MLB API (which returns ERA as a string).
 * Non-numeric placeholders ("-.--", "INF", "*.**", "") become null.
 */
function parseEra(raw: any): number | null {
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }
  const era = parseFloat(raw);
  return Number.isFinite(era) ? era : null;
}

/**
 * Fetch a team's bullpen (relief-pitcher) season ERA, pre-game.
 *
 * Primary source — relief-only split (bullpen-specific):
 *   /teams/{id}/stats?stats=statSplits&group=pitching&sitCodes=rp
 *   path: stats[0].splits[] where split.code === 'rp' -> stat.era
 * Fallback — whole-staff team pitching ERA (includes starters):
 *   /teams/{id}/stats?stats=season&group=pitching
 *   path: stats[0].splits[0].stat.era
 *
 * @param teamId MLB team ID
 * @returns { era, source } where source is 'rp' | 'whole-staff' | 'unavailable'
 */
export async function getTeamBullpenEra(
  teamId: number
): Promise<{ era: number | null; source: 'rp' | 'whole-staff' | 'unavailable' }> {
  const season = new Date().getFullYear();

  // 1) Preferred: relief-only (bullpen-specific) ERA
  try {
    const response = await fetch(
      `${MLB_API_BASE}/teams/${teamId}/stats?stats=statSplits&group=pitching&sitCodes=rp&season=${season}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    if (response.ok) {
      const data: any = await response.json();
      const splits = data?.stats?.[0]?.splits || [];
      const rp = splits.find((s: any) => s?.split?.code === 'rp');
      const era = parseEra(rp?.stat?.era);
      if (era !== null) {
        console.log(`[bullpenEra] teamId=${teamId}: era=${era}, source=rp`);
        return { era, source: 'rp' };
      }
    } else {
      console.error(`[MLB API] Bullpen rp split error for ${teamId}: ${response.status}`);
    }
  } catch (error) {
    console.error(`[MLB API] Bullpen rp split error for ${teamId}:`, error);
  }

  // 2) Fallback: whole-staff team pitching ERA
  try {
    const response = await fetch(
      `${MLB_API_BASE}/teams/${teamId}/stats?stats=season&group=pitching&season=${season}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    if (response.ok) {
      const data: any = await response.json();
      const era = parseEra(data?.stats?.[0]?.splits?.[0]?.stat?.era);
      if (era !== null) {
        console.log(`[bullpenEra] teamId=${teamId}: era=${era}, source=whole-staff (rp unavailable)`);
        return { era, source: 'whole-staff' };
      }
    } else {
      console.error(`[MLB API] Whole-staff pitching error for ${teamId}: ${response.status}`);
    }
  } catch (error) {
    console.error(`[MLB API] Whole-staff pitching error for ${teamId}:`, error);
  }

  // 3) Both failed
  console.log(`[bullpenEra] teamId=${teamId}: era=N/A, source=unavailable`);
  return { era: null, source: 'unavailable' };
}

/**
 * Fetch a pitcher's current-season ERA by player ID.
 *
 * Endpoint: /people/{id}/stats?stats=season&group=pitching
 * (Verified to return current-season ERA; the API returns ERA as a string.)
 *
 * @param pitcherId MLB person/player ID (from probablePitcher.id)
 * @returns Season ERA as a number, or null if unavailable
 */
export async function getPitcherSeasonEra(pitcherId: number): Promise<number | null> {
  try {
    const response = await fetch(
      `${MLB_API_BASE}/people/${pitcherId}/stats?stats=season&group=pitching`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error(`[MLB API] Error fetching pitcher ERA for ${pitcherId}: ${response.status}`);
      return null;
    }

    const data: any = await response.json();

    // Season pitching stats live at stats[0].splits[0].stat.era (string form)
    const split = data?.stats?.[0]?.splits?.[0];
    const rawEra = split?.stat?.era;

    if (rawEra === undefined || rawEra === null || rawEra === '') {
      return null;
    }

    // ERA arrives as a string like "1.74"; non-numeric placeholders ("-.--",
    // "INF", "*.**") parse to NaN and are treated as unavailable.
    const era = parseFloat(rawEra);
    return Number.isFinite(era) ? era : null;
  } catch (error) {
    console.error(`[MLB API] Error fetching pitcher ERA for ${pitcherId}:`, error);
    return null;
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
