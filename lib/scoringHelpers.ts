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

/**
 * Calculate Last 30 Games scoring factor from real team recent run statistics
 * 
 * Uses the average runs from the last 30 games for both teams to calculate
 * a composite scoring factor.
 * 
 * Formula:
 * - Get average runs from last 30 games for each team
 * - Calculate combined average: (homeAvgRuns + awayAvgRuns) / 2
 * - Map to 0-100 score using interpolation:
 *   - 6.0 runs = 20
 *   - 7.0 runs = 40
 *   - 8.0 runs = 60
 *   - 9.0 runs = 75
 *   - 10.0 runs = 90
 *   - 11.0+ runs = 100
 * 
 * @param game Game object containing team stats
 * @returns Last 30 Games trend score (0-100)
 */
export function calculateLast30GamesTrend(game: Game): number {
  const homeStats = game.homeTeamStats;
  const awayStats = game.awayTeamStats;

  // Get average runs from last 30 games for each team
  const homeAvgRuns = homeStats.last30AvgRuns;
  const awayAvgRuns = awayStats.last30AvgRuns;

  // Calculate combined average runs
  const combinedRuns = (homeAvgRuns + awayAvgRuns) / 2;

  // Map runs to 0-100 score using interpolation
  let score: number;
  
  if (combinedRuns <= 6.0) {
    score = 20;
  } else if (combinedRuns <= 7.0) {
    // Interpolate between 6.0 (20) and 7.0 (40)
    score = 20 + ((combinedRuns - 6.0) / 1.0) * (40 - 20);
  } else if (combinedRuns <= 8.0) {
    // Interpolate between 7.0 (40) and 8.0 (60)
    score = 40 + ((combinedRuns - 7.0) / 1.0) * (60 - 40);
  } else if (combinedRuns <= 9.0) {
    // Interpolate between 8.0 (60) and 9.0 (75)
    score = 60 + ((combinedRuns - 8.0) / 1.0) * (75 - 60);
  } else if (combinedRuns <= 10.0) {
    // Interpolate between 9.0 (75) and 10.0 (90)
    score = 75 + ((combinedRuns - 9.0) / 1.0) * (90 - 75);
  } else {
    // 11.0+ runs = 100
    score = 100;
  }

  // Round to nearest integer
  const roundedScore = Math.round(score);

  // Log for verification
  console.log(
    `[last30Games] ${game.homeTeam} vs ${game.awayTeam}: ` +
    `Home=${homeAvgRuns} runs, Away=${awayAvgRuns} runs, ` +
    `Combined=${combinedRuns.toFixed(2)} runs, ` +
    `Score=${roundedScore}`
  );

  return roundedScore;
}
