'use client';

import Link from 'next/link';
import { Game } from '@/lib/mockData';

interface GameCardProps {
  game: Game;
  rank: number;
  highlightedThreshold?: 'all' | 'over55' | 'over65' | 'over75' | 'over85';
}

const getScoreColor = (value: number) => {
  if (value >= 75) return '#10B981'; // Green
  if (value >= 60) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
};

const getProbabilityColor = (value: number) => {
  if (value >= 75) return { bg: '#DBEAFE', text: '#0C2340', border: '#0C2340' }; // Blue with navy
  if (value >= 60) return { bg: '#FECACA', text: '#7F1D1D', border: '#DC2626' }; // Light red
  return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' }; // Light red
};

export default function GameCard({ game, rank, highlightedThreshold = 'all' }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`} className="block mb-4">
      <div className="bg-gray-800 hover:bg-gray-700 transition-colors p-4 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="font-bold text-gray-400 w-8 text-center">#{rank}</div>

          {/* Matchup and Time */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-white text-sm">{game.awayTeam} @ {game.homeTeam}</span>
              <span className="text-xs text-gray-400">{game.time}</span>
            </div>
          </div>

          {/* Run Score */}
          <div className="font-bold text-white px-3 py-1 rounded" style={{ backgroundColor: getScoreColor(game.runScore) }}>
            {game.runScore}
          </div>

          {/* Probability Tiles */}
          <div className="flex gap-2">
            {[
              { threshold: 'over55', label: 'O5.5', value: game.thresholds.over55 },
              { threshold: 'over65', label: 'O6.5', value: game.thresholds.over65 },
              { threshold: 'over75', label: 'O7.5', value: game.thresholds.over75 },
              { threshold: 'over85', label: 'O8.5', value: game.thresholds.over85 },
            ].map(({ threshold, label, value }) => {
              const isHighlighted = highlightedThreshold === threshold;
              return (
                <div
                  key={threshold}
                  className={`rounded px-2 py-1 text-center transition-all ${
                    isHighlighted ? 'ring-2 ring-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: isHighlighted ? '#BA0C2F' : '#374151',
                    color: isHighlighted ? 'white' : '#D1D5DB',
                  }}
                >
                  <div className="font-bold text-xs">{value}%</div>
                  <div className="text-xs opacity-70">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
