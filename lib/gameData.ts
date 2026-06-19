/**
 * Shared server-side game data functions
 * Used by both API routes and server components to avoid circular dependencies
 */

import { getSchedule } from './mlbApi';
import { transformScheduleGames } from './mlbTransform';
import { mockGames, Game } from './mockData';

/**
 * Get all games for today with real schedule + mock scores blended
 */
export async function getTodayGames(): Promise<Game[]> {
  try {
    // Fetch real schedule from MLB API
    const mlbGames = await getSchedule();

    // If no real games found, return mock games as fallback
    if (mlbGames.length === 0) {
      console.log('[gameData] No real games found, returning mock games');
      return mockGames;
    }

    // Transform MLB games to our Game interface
    // Blend real schedule with real team stats + mock scoring data
    const transformedGames = await transformScheduleGames(mlbGames, mockGames);

    // Ensure all games have required fields (fill missing with mock if needed)
    const enrichedGames = transformedGames.map((game, index) => {
      // If a game has missing required fields, fall back to mock
      if (!game.runScore || !game.thresholds) {
        const fallbackMock = mockGames[index % mockGames.length];
        return {
          ...game,
          id: game.id || fallbackMock.id,
          homeTeam: game.homeTeam || fallbackMock.homeTeam,
          awayTeam: game.awayTeam || fallbackMock.awayTeam,
          time: game.time || fallbackMock.time,
          runScore: game.runScore || fallbackMock.runScore,
          thresholds: game.thresholds || fallbackMock.thresholds,
          homeTeamStats: game.homeTeamStats || fallbackMock.homeTeamStats,
          awayTeamStats: game.awayTeamStats || fallbackMock.awayTeamStats,
          homePitcher: game.homePitcher || fallbackMock.homePitcher,
          awayPitcher: game.awayPitcher || fallbackMock.awayPitcher,
          scoringBreakdown: game.scoringBreakdown || fallbackMock.scoringBreakdown,
        };
      }
      return game as Game;
    });

    return enrichedGames;
  } catch (error) {
    console.error('[gameData] Error fetching today games:', error);
    // On error, return mock games
    return mockGames;
  }
}

/**
 * Get a single game by ID
 * First tries to find in real schedule, then falls back to mock games
 */
export async function getGameById(id: string): Promise<Game | null> {
  try {
    // Fetch today's games (which includes real schedule + mock scores)
    const games = await getTodayGames();

    // Find game by ID
    const game = games.find((g) => g.id === id);

    return game || null;
  } catch (error) {
    console.error('[gameData] Error fetching game by ID:', error);
    return null;
  }
}
