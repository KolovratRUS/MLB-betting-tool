/**
 * Shared server-side game data functions
 * Used by both API routes and server components to avoid circular dependencies
 */

import { getSchedule } from './mlbApi';
import { transformScheduleGames } from './mlbTransform';
import { mockGames, Game } from './mockData';
import { calculateSeasonOversPerformance } from './scoringHelpers';
import { calculateLast30GamesTrend } from './scoringHelpers';
import { calculateThresholds } from './scoringHelpers';
import { calculatePitcherPerformance } from './scoringHelpers';
import { calculateBullpenQuality } from './scoringHelpers';
import { calculateOtherFactors } from './scoringHelpers';
import { calculateRunScore } from './scoringHelpers';

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
    // Blend real schedule with real team stats + real pitcher data
    const transformedGames = await transformScheduleGames(mlbGames, mockGames);

    // Ensure all games have required fields (fill missing with mock if needed)
    const enrichedGames = transformedGames.map((game, index) => {
      // If a game has missing required fields, fall back to mock
      if (!game.runScore || !game.thresholds) {
        const fallbackMock = mockGames[index % mockGames.length];
        game = {
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
      
      // Cast to Game type with all required fields for calculation
      const fullGame = game as Game;
      
      // Calculate real thresholds from team stats
      const realThresholds = calculateThresholds(fullGame);
      
      // Calculate Season Overs performance from real team stats (always, even with fallback)
      const seasonOversScore = calculateSeasonOversPerformance(fullGame);
      
      // Calculate Last 30 Games trend from real team stats (always, even with fallback)
      const last30GamesScore = calculateLast30GamesTrend(fullGame);
      
      // Calculate pitcher performance from real starting pitcher ERA values
      // Use ?? so a genuine 0.00 ERA is preserved; null (unavailable) yields the neutral default inside the helper
      const pitcherScore = calculatePitcherPerformance(fullGame.homePitcher?.era ?? null, fullGame.awayPitcher?.era ?? null);
      
      // Calculate bullpen quality from real relief-pitcher (bullpen) season ERA.
      // Independent of oversRate, so it no longer double-counts Season Overs.
      const homeBullpenEra = fullGame.homeBullpenEra ?? null;
      const awayBullpenEra = fullGame.awayBullpenEra ?? null;
      const bullpenScore = calculateBullpenQuality(homeBullpenEra, awayBullpenEra);

      // Calculate Other Factors from the ballpark run environment (park/environment proxy)
      const otherFactorsScore = calculateOtherFactors(fullGame);

      // Calculate the overall Run Score as a weighted blend of the five factors
      const realRunScore = calculateRunScore({
        seasonOversPerformance: seasonOversScore,
        last30GamesTrend: last30GamesScore,
        opposingPitcherQuality: pitcherScore,
        opposingBullpenQuality: bullpenScore,
        otherFactors: otherFactorsScore,
      });

      // Log factor values and final Run Score for verification
      console.log(
        `[runScore] ${fullGame.awayTeam} @ ${fullGame.homeTeam}: ` +
        `seasonOvers=${seasonOversScore} (45%), ` +
        `last30=${last30GamesScore} (20%), ` +
        `pitcher=${pitcherScore} (15%), ` +
        `bullpen=${bullpenScore} (10%), ` +
        `other=${otherFactorsScore} (10%) ` +
        `=> runScore=${realRunScore}`
      );

      return {
        ...fullGame,
        runScore: realRunScore,
        thresholds: realThresholds,
        scoringBreakdown: {
          ...fullGame.scoringBreakdown,
          seasonOversPerformance: seasonOversScore,
          last30GamesTrend: last30GamesScore,
          opposingPitcherQuality: pitcherScore,
          opposingBullpenQuality: bullpenScore,
          otherFactors: otherFactorsScore,
        },
      };
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
