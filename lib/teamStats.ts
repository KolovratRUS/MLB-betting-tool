/**
 * Team statistics calculations from MLB API data
 */

import { getTeamGameResults, getTeamIdByName } from './mlbApi';

export interface TeamStats {
  over55Rate: number;
  over65Rate: number;
  over75Rate: number;
  over85Rate: number;
  oversRate: number; // Backward compatibility: average of the four rates
  last30AvgRuns: number;
  season: string;
}

/**
 * Calculate the percentage of games where total runs exceeded a specific threshold
 * Total runs = home team score + away team score
 * Handles games from the MLB schedule endpoint
 * @param games Array of game results from schedule endpoint
 * @param threshold Run threshold (5.5, 6.5, 7.5, 8.5) for total game runs
 * @returns Percentage of games over threshold
 */
function calculateOverRate(
  games: any[],
  threshold: number
): number {
  if (games.length === 0) return 0;

  const overs = games.filter((game) => {
    if (!game.status || game.status.abstractGameState !== 'Final') {
      return false;
    }
    
    // Get total runs in the game (home + away)
    const homeScore = game.teams?.home?.score || game.homeScore || 0;
    const awayScore = game.teams?.away?.score || game.awayScore || 0;
    const totalRuns = homeScore + awayScore;
    
    return totalRuns > threshold;
  }).length;

  return Math.round((overs / games.length) * 100);
}

/**
 * Calculate average total runs per game in last N days
 * Total runs = home team score + away team score
 * @param games Array of game results from schedule endpoint
 * @param days Number of days to look back (approximately)
 * @returns Average total runs per game
 */
function calculateLastNDaysAvgRuns(
  games: any[],
  days: number
): number {
  if (games.length === 0) return 0;

  // Calculate the cutoff date (approximately)
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const recentGames = games.filter((game) => {
    if (!game.status || game.status.abstractGameState !== 'Final') {
      return false;
    }
    
    const gameDate = new Date(game.gameDate);
    return gameDate >= cutoffDate;
  });

  if (recentGames.length === 0) return 0;

  const totalRuns = recentGames.reduce((sum, game) => {
    // Get total runs in the game (home + away)
    const homeScore = game.teams?.home?.score || game.homeScore || 0;
    const awayScore = game.teams?.away?.score || game.awayScore || 0;
    const gameTotal = homeScore + awayScore;
    return sum + gameTotal;
  }, 0);

  return Math.round((totalRuns / recentGames.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get team statistics by team name
 * @param teamName Team name (e.g., "Boston Red Sox")
 * @param isHome Whether calculating for home or away team (used for logging)
 * @returns Team statistics or null if unable to fetch
 */
export async function getTeamStatsById(teamId: number | null, teamName: string): Promise<TeamStats | null> {
  if (!teamId) {
    console.log(`[teamStats] No team ID found for ${teamName}, will use mock stats`);
    return null;
  }

  try {
    // Fetch games for current season
    const games = await getTeamGameResults(teamId);

    if (games.length === 0) {
      console.log(`[teamStats] No games found for team ID ${teamId} (${teamName}), will use mock stats`);
      return null;
    }

    // Calculate statistics for total game runs (home + away scores)
    const over55 = calculateOverRate(games, 5.5);
    const over65 = calculateOverRate(games, 6.5);
    const over75 = calculateOverRate(games, 7.5);
    const over85 = calculateOverRate(games, 8.5);
    const last30Avg = calculateLastNDaysAvgRuns(games, 30);

    const gamesPlayed = games.length;

    console.log(
      `[teamStats] ${teamName} (ID: ${teamId}): Over 5.5=${over55}%, Over 6.5=${over65}%, Over 7.5=${over75}%, Over 8.5=${over85}%, Last 30 avg=${last30Avg} runs, Games=${gamesPlayed}`
    );

    // Calculate average over rate for backward compatibility
    const avgOverRate = Math.round((over55 + over65 + over75 + over85) / 4);

    return {
      over55Rate: over55,
      over65Rate: over65,
      over75Rate: over75,
      over85Rate: over85,
      oversRate: avgOverRate,
      last30AvgRuns: last30Avg,
      season: `${gamesPlayed} games played`,
    };
  } catch (error) {
    console.error(`[teamStats] Error calculating stats for ${teamName}:`, error);
    return null;
  }
}

/**
 * Get team statistics by team name
 * @param teamName Team name (e.g., "Boston Red Sox")
 * @returns Team statistics or null if unable to fetch
 */
export async function getTeamStatsByName(teamName: string): Promise<TeamStats | null> {
  try {
    const teamId = await getTeamIdByName(teamName);
    return await getTeamStatsById(teamId, teamName);
  } catch (error) {
    console.error(`[teamStats] Error getting team ID for ${teamName}:`, error);
    return null;
  }
}
