import { NextResponse } from 'next/server';
import { getTodayGames } from '@/lib/gameData';

// Always run this handler at request time. This guarantees the "today" date is
// recomputed (in Eastern Time) on every request and the route is never frozen
// to a build-time day, so a deployed instance shows the correct slate each day
// without needing a redeploy.
export const dynamic = 'force-dynamic';

/**
 * GET /api/games/today
 * Fetch today's MLB schedule and blend with mock scoring data
 * Falls back to mock games if API is unavailable
 */
export async function GET() {
  try {
    const games = await getTodayGames();
    return NextResponse.json(games);
  } catch (error) {
    console.error('[API] Error in /api/games/today:', error);
    // Return empty array on error (Dashboard will show "No games found")
    return NextResponse.json([]);
  }
}
