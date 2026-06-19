/**
 * Transform MLB API responses to Game interface format
 */

import { Game } from './mockData';
import { MLBGame, getTeamIdByName } from './mlbApi';
import { getTeamStatsById } from './teamStats';

/**
 * Parse game time from ISO datetime string to readable format
 * @param isoDateTime ISO 8601 datetime string (e.g., "2026-06-19T18:20:00Z")
 * @returns Time in format like "7:05 PM"
 */
function formatGameTime(isoDateTime: string): string {
  try {
    if (!isoDateTime || typeof isoDateTime !== 'string') {
      return 'TBD';
    }
    
    const date = new Date(isoDateTime);
    
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      return 'TBD';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'TBD';
  }
}

/**
 * Transform a single MLB game to Game interface format
 * Includes only schedule data (team names, time, ID)
 * Other fields should be provided separately (scores, stats, etc.)
 */
export function transformScheduleGame(
  mlbGame: MLBGame,
  mockGameData?: Partial<Game>
): Partial<Game> {
  return {
    id: String(mlbGame.gamePk),
    homeTeam: mlbGame.teams.home.team.name,
    awayTeam: mlbGame.teams.away.team.name,
    time: formatGameTime(mlbGame.gameDate),
    // Spread mock data to preserve scores, stats, pitchers for now
    ...mockGameData,
  };
}

/**
 * Transform an array of MLB games to Game interface format with real team stats
 * @param mlbGames Array of games from MLB API
 * @param mockGames Mock games for fallback/blending
 * @returns Transformed games with real schedule + real team stats + mock scoring data
 */
export async function transformScheduleGames(
  mlbGames: MLBGame[],
  mockGames: Game[]
): Promise<Partial<Game>[]> {
  return Promise.all(
    mlbGames.map(async (mlbGame) => {
      // Try to find matching mock game to blend mock scores
      // Match by home/away teams (case-insensitive)
      const mockGame = mockGames.find(
        (mock) =>
          mock.homeTeam.toLowerCase() === mlbGame.teams.home.team.name.toLowerCase() &&
          mock.awayTeam.toLowerCase() === mlbGame.teams.away.team.name.toLowerCase()
      );

      // Get real team IDs and stats for both teams
      const homeTeamName = mlbGame.teams.home.team.name;
      const awayTeamName = mlbGame.teams.away.team.name;

      // Try to get team IDs from MLB API or use provided IDs
      let homeTeamId: number | null = mlbGame.teams.home.team.id || null;
      let awayTeamId: number | null = mlbGame.teams.away.team.id || null;

      if (!homeTeamId) {
        homeTeamId = await getTeamIdByName(homeTeamName);
      }
      if (!awayTeamId) {
        awayTeamId = await getTeamIdByName(awayTeamName);
      }

      // Fetch real team statistics
      const homeTeamStats = await getTeamStatsById(homeTeamId, homeTeamName);
      const awayTeamStats = await getTeamStatsById(awayTeamId, awayTeamName);

      return transformScheduleGame(mlbGame, {
        runScore: mockGame?.runScore,
        thresholds: mockGame?.thresholds,
        homeTeamStats: homeTeamStats || mockGame?.homeTeamStats,
        awayTeamStats: awayTeamStats || mockGame?.awayTeamStats,
        homePitcher: mockGame?.homePitcher,
        awayPitcher: mockGame?.awayPitcher,
        scoringBreakdown: mockGame?.scoringBreakdown,
      });
    })
  );
}
