/**
 * Scoring helper functions for calculating game factors from team statistics
 */

import { Game } from './mockData';

/**
 * Calculate Season Overs performance factor from real team over-rate statistics
 * 
 * Uses the individual threshold rates (over55Rate, over65Rate, over75Rate, over85Rate)
 * from both teams to calculate a composite season overs score.
 * 
 * Formula:
 * - Get the average over-rate (oversRate) for each team
 * - Combine both team rates to get the matchup overs expectation
 * - Scale to 0-100 range
 * 
 * @param game Game object containing team stats
 * @returns Season Overs performance score (0-100)
 */
export function calculateSeasonOversPerformance(game: Game): number {
  const homeStats = game.homeTeamStats;
  const awayStats = game.awayTeamStats;

  // Calculate average of the four threshold rates for each team
  // (using the explicit rates if available, fallback to oversRate)
  const homeAvgRate = homeStats.oversRate;
  const awayAvgRate = awayStats.oversRate;

  // Combine both team rates to get matchup expectation
  // Weighted average: slightly favor home team (55% home, 45% away)
  const combinedRate = Math.round((homeAvgRate * 0.55) + (awayAvgRate * 0.45));

  // Log for verification
  console.log(
    `[seasonOvers] ${game.homeTeam} vs ${game.awayTeam}: ` +
    `Home=${homeAvgRate}% (O5.5=${homeStats.over55Rate}% O6.5=${homeStats.over65Rate}% O7.5=${homeStats.over75Rate}% O8.5=${homeStats.over85Rate}%) ` +
    `Away=${awayAvgRate}% (O5.5=${awayStats.over55Rate}% O6.5=${awayStats.over65Rate}% O7.5=${awayStats.over75Rate}% O8.5=${awayStats.over85Rate}%) ` +
    `Combined=${combinedRate}%`
  );

  return combinedRate;
}
