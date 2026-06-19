/**
 * Transform MLB API responses to Game interface format
 */

import { Game } from './mockData';
import { MLBGame, getTeamIdByName, getPitcherSeasonEra } from './mlbApi';
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
 * Extract pitcher data from hydrated schedule response.
 * The MLB schedule endpoint with hydrate=probablePitcher includes the pitcher
 * name and ID, but not ERA. We use the ID to fetch the real current-season ERA
 * from /people/{id}/stats?stats=season&group=pitching. If the ID is missing or
 * the lookup fails, era is left null so the UI shows "N/A".
 */
interface ExtractedPitcher {
  name: string;
  era: number | null;
}

async function extractPitcherData(
  probablePitcherObj: any,
  team: 'home' | 'away'
): Promise<ExtractedPitcher> {
  try {
    // Get pitcher name and ID from schedule response
    const pitcherName = probablePitcherObj?.fullName || 'TBD';
    const pitcherId: number | null = probablePitcherObj?.id ?? null;

    // Fetch real season ERA by pitcher ID (null if unavailable)
    let era: number | null = null;
    if (pitcherId) {
      era = await getPitcherSeasonEra(pitcherId);
    }

    // Log pitcher name, ID, and whether ERA was found
    console.log(
      `[pitcherEra] ${team}: name=${pitcherName}, id=${pitcherId ?? 'N/A'}, ` +
      `era=${era !== null ? era : 'unavailable'}`
    );

    return { name: pitcherName, era };
  } catch (error) {
    console.log(`[mlbTransform] Error extracting pitcher data for ${team} team:`, error);
    return { name: 'TBD', era: null };
  }
}

/**
 * Transform a single MLB game to Game interface format
 * Includes only schedule data (team names, time, ID)
 * Other fields should be provided separately (scores, stats, etc.)
 */
export function transformScheduleGame(
  mlbGame: MLBGame,
  mockGameData?: Partial<Game>,
  realPitchers?: { home: ExtractedPitcher; away: ExtractedPitcher }
): Partial<Game> {
  return {
    id: String(mlbGame.gamePk),
    homeTeam: mlbGame.teams.home.team.name,
    awayTeam: mlbGame.teams.away.team.name,
    time: formatGameTime(mlbGame.gameDate),
    // Spread mock data to preserve scores, stats
    ...mockGameData,
    // Override with real pitcher data if available
    ...(realPitchers && {
      homePitcher: {
        name: realPitchers.home.name,
        era: realPitchers.home.era, // number, or null when ERA is unavailable
      },
      awayPitcher: {
        name: realPitchers.away.name,
        era: realPitchers.away.era, // number, or null when ERA is unavailable
      },
    }),
  };
}

/**
 * Transform an array of MLB games to Game interface format with real team stats
 * @param mlbGames Array of games from MLB API (with probable pitchers hydrated)
 * @param mockGames Mock games for fallback/blending
 * @returns Transformed games with real schedule + real team stats + real pitcher names
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

      // Extract real pitcher data from hydrated schedule response
      const [homePitcher, awayPitcher] = await Promise.all([
        extractPitcherData(mlbGame.teams.home.probablePitcher, 'home'),
        extractPitcherData(mlbGame.teams.away.probablePitcher, 'away'),
      ]);

      // Log extracted pitcher data for verification
      console.log(
        `[pitchers] ${awayTeamName} @ ${homeTeamName}: ` +
        `awayPitcher=${awayPitcher.name}, ` +
        `homePitcher=${homePitcher.name}`
      );

      return transformScheduleGame(
        mlbGame,
        {
          runScore: mockGame?.runScore,
          thresholds: mockGame?.thresholds,
          homeTeamStats: homeTeamStats || mockGame?.homeTeamStats,
          awayTeamStats: awayTeamStats || mockGame?.awayTeamStats,
          scoringBreakdown: mockGame?.scoringBreakdown,
        },
        {
          home: homePitcher,
          away: awayPitcher,
        }
      );
    })
  );
}
