import { NextResponse } from 'next/server';
import { getGameById } from '@/lib/gameData';

/**
 * GET /api/games/[id]
 * Fetch a single game by ID and blend with mock scoring data
 * Falls back to mock games if game not found
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await getGameById(id);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('[API] Error in /api/games/[id]:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}
