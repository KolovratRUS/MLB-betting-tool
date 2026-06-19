/**
 * Transform MLB API responses to Game interface format
 */

import { Game } from './mockData';
import { MLBGame } from './mlbApi';

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
 * Transform an array of MLB games to Game interface format
 * @param mlbGames Array of games from MLB API
 * @param mockGames Mock games for fallback/blending
 * @returns Transformed games with real schedule + mock scoring data
 */
export function transformScheduleGames(
  mlbGames: MLBGame[],
  mockGames: Game[]
): Partial<Game>[] {
  return mlbGames.map((mlbGame) => {
    // Try to find matching mock game to blend mock scores
    // Match by home/away teams (case-insensitive)
    const mockGame = mockGames.find(
      (mock) =>
        mock.homeTeam.toLowerCase() === mlbGame.teams.home.team.name.toLowerCase() &&
        mock.awayTeam.toLowerCase() === mlbGame.teams.away.team.name.toLowerCase()
    );

    return transformScheduleGame(mlbGame, {
      runScore: mockGame?.runScore,
      thresholds: mockGame?.thresholds,
      homeTeamStats: mockGame?.homeTeamStats,
      awayTeamStats: mockGame?.awayTeamStats,
      homePitcher: mockGame?.homePitcher,
      awayPitcher: mockGame?.awayPitcher,
      scoringBreakdown: mockGame?.scoringBreakdown,
    });
  });
}
