'use client';

import Link from 'next/link';
import { mockGames } from '@/lib/mockData';

interface MatchupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MatchupAnalysis({ params }: MatchupPageProps) {
  const { id } = await params;
  const game = mockGames.find((g) => g.id === id);

  if (!game) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 mb-8 inline-block">
            ← Back
          </Link>
          <p className="text-gray-300">Game not found</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (value: number) => {
    if (value >= 75) return '#10B981';
    if (value >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 mb-6 inline-block">
          ← Back
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">{game.awayTeam} @ {game.homeTeam}</h1>
          <p className="text-gray-400 text-sm mt-1">{game.time}</p>
        </div>

        {/* Run Score and Thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <div className="md:col-span-1 rounded-lg p-4" style={{ backgroundColor: getScoreColor(game.runScore) }}>
            <p className="text-xs text-gray-100 opacity-90 uppercase">Run Score</p>
            <p className="text-3xl font-black text-white mt-2">{game.runScore}</p>
          </div>
          {[
            { label: 'O5.5', value: game.thresholds.over55 },
            { label: 'O6.5', value: game.thresholds.over65 },
            { label: 'O7.5', value: game.thresholds.over75 },
            { label: 'O8.5', value: game.thresholds.over85 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 uppercase">{label}</p>
              <p className="text-2xl font-black text-white mt-2">{value}%</p>
            </div>
          ))}
        </div>

        {/* Scoring Breakdown */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Scoring Factors</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Season Overs Performance */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">Season Overs (45%)</h3>
              <div className="text-xs text-gray-400 mb-3 space-y-1">
                <p><span className="text-white">{game.homeTeam}</span>: {game.homeTeamStats.oversRate}%</p>
                <p><span className="text-white">{game.awayTeam}</span>: {game.awayTeamStats.oversRate}%</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${game.scoringBreakdown.seasonOversPerformance}%` }}></div>
                </div>
                <span className="font-bold text-blue-400 text-sm w-10 text-right">{game.scoringBreakdown.seasonOversPerformance}</span>
              </div>
            </div>

            {/* Last 30 Games Trend */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">Last 30 Games (20%)</h3>
              <div className="text-xs text-gray-400 mb-3 space-y-1">
                <p><span className="text-white">{game.homeTeam}</span>: {game.homeTeamStats.last30AvgRuns} runs</p>
                <p><span className="text-white">{game.awayTeam}</span>: {game.awayTeamStats.last30AvgRuns} runs</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-600 h-full" style={{ width: `${game.scoringBreakdown.last30GamesTrend}%` }}></div>
                </div>
                <span className="font-bold text-green-400 text-sm w-10 text-right">{game.scoringBreakdown.last30GamesTrend}</span>
              </div>
            </div>

            {/* Opposing Pitcher Quality */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">Pitchers (15%)</h3>
              <div className="text-xs text-gray-400 mb-3 space-y-1">
                <p><span className="text-white">{game.homeTeam}</span>: {game.homePitcher.name} ({game.homePitcher.era} ERA)</p>
                <p><span className="text-white">{game.awayTeam}</span>: {game.awayPitcher.name} ({game.awayPitcher.era} ERA)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-600 h-full" style={{ width: `${game.scoringBreakdown.opposingPitcherQuality}%` }}></div>
                </div>
                <span className="font-bold text-purple-400 text-sm w-10 text-right">{game.scoringBreakdown.opposingPitcherQuality}</span>
              </div>
            </div>

            {/* Opposing Bullpen Quality */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">Bullpen (10%)</h3>
              <div className="text-xs text-gray-400 mb-3">ERA and relief effectiveness</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-orange-600 h-full" style={{ width: `${game.scoringBreakdown.opposingBullpenQuality}%` }}></div>
                </div>
                <span className="font-bold text-orange-400 text-sm w-10 text-right">{game.scoringBreakdown.opposingBullpenQuality}</span>
              </div>
            </div>

            {/* Other Factors */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:col-span-2">
              <h3 className="text-sm font-bold text-white mb-3">Other Factors (10%)</h3>
              <div className="text-xs text-gray-400 mb-3">Ballpark, home/away, environment</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-red-600 h-full" style={{ width: `${game.scoringBreakdown.otherFactors}%` }}></div>
                </div>
                <span className="font-bold text-red-400 text-sm w-10 text-right">{game.scoringBreakdown.otherFactors}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
