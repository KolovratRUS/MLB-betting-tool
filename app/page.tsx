'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import { Game } from '@/lib/mockData';

type Threshold = 'all' | 'over55' | 'over65' | 'over75' | 'over85';

export default function Dashboard() {
  const [selectedThreshold, setSelectedThreshold] = useState<Threshold>('all');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch games from API on mount
  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch('/api/games/today');
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const sortedGames = useMemo(() => {
    if (selectedThreshold === 'all') {
      return [...games].sort((a, b) => b.runScore - a.runScore);
    }

    const thresholdKey = selectedThreshold as keyof Game['thresholds'];
    return [...games].sort(
      (a, b) => b.thresholds[thresholdKey] - a.thresholds[thresholdKey]
    );
  }, [selectedThreshold, games]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">MLB Run Screening</h1>
          <p className="text-gray-400 text-sm">{loading ? 'Loading...' : `${sortedGames.length} games • Updated from MLB data`}</p>
        </div>

        {/* Threshold Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedThreshold('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selectedThreshold === 'all'
                ? 'text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={selectedThreshold === 'all' ? { backgroundColor: '#BA0C2F' } : {}}
          >
            All
          </button>
          {['over55', 'over65', 'over75', 'over85'].map((threshold) => {
            const fullLabel = threshold === 'over55' ? 'O5.5' : threshold === 'over65' ? 'O6.5' : threshold === 'over75' ? 'O7.5' : 'O8.5';
            return (
            <button
              key={threshold}
              onClick={() => setSelectedThreshold(threshold as any)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedThreshold === threshold
                  ? 'text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={selectedThreshold === threshold ? { backgroundColor: '#BA0C2F' } : {}}
            >
              {fullLabel}
            </button>
            );
          })}
          <div className="ml-auto">
            <Link
              href="/multi-builder"
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#BA0C2F' }}
            >
              Parlays
            </Link>
          </div>
        </div>

        {/* Games List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading games...</div>
          ) : sortedGames.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No games found for today</div>
          ) : (
            sortedGames.map((game, index) => (
              <GameCard key={game.id} game={game} rank={index + 1} highlightedThreshold={selectedThreshold} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
