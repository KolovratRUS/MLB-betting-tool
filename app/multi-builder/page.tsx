'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockGames } from '@/lib/mockData';

export default function MultiBuilder() {
  const [selectedThreshold, setSelectedThreshold] = useState<'over55' | 'over65' | 'over75' | 'over85'>('over55');
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);

  // Sort games by selected threshold
  const sortedGames = useMemo(() => {
    return [...mockGames]
      .sort((a, b) => {
        const thresholdKey = selectedThreshold as keyof typeof a.thresholds;
        return b.thresholds[thresholdKey] - a.thresholds[thresholdKey];
      });
  }, [selectedThreshold]);

  // Generate top 3 combinations
  const get2LegCombos = () => {
    const combos: Array<{ games: typeof mockGames; hitRate: number }> = [];
    const thresholdKey = selectedThreshold as 'over55' | 'over65' | 'over75' | 'over85';
    for (let i = 0; i < sortedGames.length; i++) {
      for (let j = i + 1; j < sortedGames.length; j++) {
        const hitRate = Math.round(
          (sortedGames[i].thresholds[thresholdKey] / 100) * (sortedGames[j].thresholds[thresholdKey] / 100) * 10000
        ) / 100;
        combos.push({
          games: [sortedGames[i], sortedGames[j]],
          hitRate,
        });
      }
    }
    return combos.sort((a, b) => b.hitRate - a.hitRate).slice(0, 3);
  };

  const get3LegCombos = () => {
    const combos: Array<{ games: typeof mockGames; hitRate: number }> = [];
    const thresholdKey = selectedThreshold as 'over55' | 'over65' | 'over75' | 'over85';
    for (let i = 0; i < sortedGames.length - 2; i++) {
      for (let j = i + 1; j < sortedGames.length - 1; j++) {
        for (let k = j + 1; k < sortedGames.length; k++) {
          const hitRate = Math.round(
            (sortedGames[i].thresholds[thresholdKey] / 100) *
              (sortedGames[j].thresholds[thresholdKey] / 100) *
              (sortedGames[k].thresholds[thresholdKey] / 100) *
              1000000
          ) / 10000;
          combos.push({
            games: [sortedGames[i], sortedGames[j], sortedGames[k]],
            hitRate,
          });
        }
      }
    }
    return combos.sort((a, b) => b.hitRate - a.hitRate).slice(0, 3);
  };

  const twoLegCombos = get2LegCombos();
  const threeLegCombos = get3LegCombos();

  const selectedGames = mockGames.filter((g) => selectedGameIds.includes(g.id));
  const thresholdKey = selectedThreshold as 'over55' | 'over65' | 'over75' | 'over85';
  const customHitRate =
    selectedGames.length > 0
      ? selectedGames.reduce((acc, game) => {
          return acc * (game.thresholds[thresholdKey] / 100);
        }, 1)
      : 0;

  const copyToClipboard = () => {
    const text = selectedGames
      .map((g) => `${g.awayTeam} +${selectedThreshold.replace('over', 'O')} + ${g.homeTeam}`)
      .join(' + ');
    navigator.clipboard.writeText(text);
    alert('Parlay copied to clipboard!');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 mb-6 inline-block">
          ← Back
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Parlay Builder</h1>
        </div>

        {/* Threshold Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['over55', 'over65', 'over75', 'over85'].map((threshold) => {
            const label = threshold.replace('over', 'O');
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 2-Leg Combos */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4">2-Leg Combos</h2>
            <div className="space-y-3">
              {twoLegCombos.map((combo, idx) => {
                const key = selectedThreshold as 'over55' | 'over65' | 'over75' | 'over85';
                return (
                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{combo.games[0].awayTeam} + {combo.games[1].awayTeam}</div>
                      <div className="text-xs text-gray-400 mt-1">{combo.games[0].thresholds[key]}% • {combo.games[1].thresholds[key]}%</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-black text-green-400">{combo.hitRate}%</div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* 3-Leg Combos */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">3-Leg Combos</h2>
            <div className="space-y-3">
              {threeLegCombos.map((combo, idx) => (
                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white">{combo.games[0].awayTeam} + {combo.games[1].awayTeam} + {combo.games[2].awayTeam}</div>
                    <div className="text-2xl font-black text-green-400 ml-4">{combo.hitRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Builder */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Custom Parlay</h2>

          {/* Game Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase">Select Games</h3>
            <div className="grid grid-cols-1 gap-2">
              {sortedGames.map((game) => {
                const key = selectedThreshold as 'over55' | 'over65' | 'over75' | 'over85';
                return (
                <label key={game.id} className="flex items-center p-3 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedGameIds.includes(game.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGameIds([...selectedGameIds, game.id]);
                      } else {
                        setSelectedGameIds(selectedGameIds.filter((id) => id !== game.id));
                      }
                    }}
                    className="w-4 h-4 accent-red-500"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-white text-sm">
                      {game.awayTeam} @ {game.homeTeam}
                    </p>
                    <p className="text-xs text-gray-400">
                      {game.thresholds[key]}% {selectedThreshold.replace('over', 'O')}
                    </p>
                  </div>
                </label>
                );
              })}
            </div>
          </div>

          {/* Parlay Summary */}
          {selectedGames.length > 0 && (
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
              <h3 className="text-sm font-bold text-white mb-3">Your {selectedGames.length}-Leg Parlay</h3>

              <div className="space-y-1 mb-4">
                {selectedGames.map((game, idx) => {
                  return (
                  <div key={game.id} className="flex justify-between items-center text-xs">
                    <p className="text-gray-300">
                      {idx + 1}. {game.awayTeam} @ {game.homeTeam}
                    </p>
                    <p className="font-semibold text-white">{game.thresholds[thresholdKey]}%</p>
                  </div>
                );
                })}
              </div>

              <div className="border-t border-gray-600 pt-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Combined Hit Rate</p>
                <p className="text-2xl font-black text-green-400">{Math.round(customHitRate * 100) / 100}%</p>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full py-2 px-4 text-white font-semibold text-sm rounded transition-colors"
                style={{ backgroundColor: '#BA0C2F' }}
              >
                Copy
              </button>
            </div>
          )}

          {selectedGames.length === 0 && (
            <div className="text-center text-gray-400 py-6 text-sm">
              <p>Select games to build</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
