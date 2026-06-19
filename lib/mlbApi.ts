/**
 * MLB StatsAPI client for fetching real-time MLB game data
 */

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

export interface MLBGame {
  gamePk: string | number;
  teams: {
    away: {
      team: {
        name: string;
      };
    };
    home: {
      team: {
        name: string;
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

/**
 * Fetch today's MLB schedule
 * @param dateStr Optional date in YYYY-MM-DD format, defaults to today
 * @returns Array of games for the specified date
 */
export async function getSchedule(dateStr?: string): Promise<MLBGame[]> {
  try {
    // Use provided date or today's date
    const date = dateStr || new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `${MLB_API_BASE}/schedule?sportId=1&date=${date}`,
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
