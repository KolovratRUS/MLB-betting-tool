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

/**
 * Calculate real threshold values from team over-rate statistics
 * 
 * Uses weighted average of home (55%) and away (45%) team rates for each threshold.
 * 
 * @param game Game object containing team stats
 * @returns Calculated threshold values (O5.5, O6.5, O7.5, O8.5)
 */
export function calculateThresholds(game: Game): {
  over55: number;
  over65: number;
  over75: number;
  over85: number;
} {
  const homeStats = game.homeTeamStats;
  const awayStats = game.awayTeamStats;

  // Calculate weighted average for each threshold (55% home, 45% away)
  const over55 = Math.round((homeStats.over55Rate * 0.55) + (awayStats.over55Rate * 0.45));
  const over65 = Math.round((homeStats.over65Rate * 0.55) + (awayStats.over65Rate * 0.45));
  const over75 = Math.round((homeStats.over75Rate * 0.55) + (awayStats.over75Rate * 0.45));
  const over85 = Math.round((homeStats.over85Rate * 0.55) + (awayStats.over85Rate * 0.45));

  // Log for verification
  console.log(
    `[thresholds] ${game.homeTeam} vs ${game.awayTeam}: ` +
    `O5.5=${over55}, O6.5=${over65}, O7.5=${over75}, O8.5=${over85}`
  );

  return { over55, over65, over75, over85 };
}

/**
 * Calculate pitcher performance score from ERA values
 * 
 * Low ERA (good pitchers) → lower scoring expectation → lower score
 * High ERA (poor pitchers) → higher scoring expectation → higher score
 * 
 * Uses interpolation between mapped values:
 * ERA <= 2.50 → 20
 * ERA = 3.00 → 35
 * ERA = 3.50 → 50
 * ERA = 4.00 → 65
 * ERA = 4.50 → 80
 * ERA >= 5.00 → 100
 * 
 * @param homeEra Home pitcher ERA (or null)
 * @param awayEra Away pitcher ERA (or null)
 * @returns Pitcher performance score (0-100)
 */
export function calculatePitcherPerformance(homeEra: number | null, awayEra: number | null): number {
  // Default ERA if unavailable
  const defaultEra = 4.0;
  const homeValue = homeEra ?? defaultEra;
  const awayValue = awayEra ?? defaultEra;

  // Calculate combined ERA (average)
  const combinedEra = (homeValue + awayValue) / 2;

  // Map ERA to score using interpolation
  let score: number;

  if (combinedEra <= 2.5) {
    score = 20;
  } else if (combinedEra <= 3.0) {
    // Interpolate between 2.5 (20) and 3.0 (35)
    score = 20 + ((combinedEra - 2.5) / 0.5) * (35 - 20);
  } else if (combinedEra <= 3.5) {
    // Interpolate between 3.0 (35) and 3.5 (50)
    score = 35 + ((combinedEra - 3.0) / 0.5) * (50 - 35);
  } else if (combinedEra <= 4.0) {
    // Interpolate between 3.5 (50) and 4.0 (65)
    score = 50 + ((combinedEra - 3.5) / 0.5) * (65 - 50);
  } else if (combinedEra <= 4.5) {
    // Interpolate between 4.0 (65) and 4.5 (80)
    score = 65 + ((combinedEra - 4.0) / 0.5) * (80 - 65);
  } else if (combinedEra <= 5.0) {
    // Interpolate between 4.5 (80) and 5.0 (100)
    score = 80 + ((combinedEra - 4.5) / 0.5) * (100 - 80);
  } else {
    // ERA >= 5.0 = 100
    score = 100;
  }

  return Math.round(score);
}

/**
 * Calculate bullpen quality score from team pitching ERA
 * 
 * Note: This uses team overall pitching ERA as a proxy for bullpen quality.
 * True bullpen-only stats would require additional complex API queries.
 * 
 * Higher team ERA (worse pitching) → higher score (more over-friendly)
 * Lower team ERA (better pitching) → lower score (less over-friendly)
 * 
 * Uses the same mapping as pitcher performance but inverted:
 * ERA <= 2.50 → 20 (excellent pitching, low overs expectation)
 * ERA = 3.00 → 35
 * ERA = 3.50 → 50
 * ERA = 4.00 → 65
 * ERA = 4.50 → 80
 * ERA >= 5.00 → 100 (poor pitching, high overs expectation)
 * 
 * @param homeTeamPitchingEra Home team pitching ERA
 * @param awayTeamPitchingEra Away team pitching ERA
 * @returns Bullpen quality score (0-100)
 */
export function calculateBullpenQuality(
  homeTeamPitchingEra: number | null,
  awayTeamPitchingEra: number | null
): number {
  // Use team ERA as proxy for bullpen quality
  // Default to 4.0 if unavailable
  const homeEra = homeTeamPitchingEra ?? 4.0;
  const awayEra = awayTeamPitchingEra ?? 4.0;

  // Calculate combined ERA (average)
  const combinedEra = (homeEra + awayEra) / 2;

  // Map ERA to score using interpolation (same as pitcher performance)
  let score: number;

  if (combinedEra <= 2.5) {
    score = 20;
  } else if (combinedEra <= 3.0) {
    score = 20 + ((combinedEra - 2.5) / 0.5) * (35 - 20);
  } else if (combinedEra <= 3.5) {
    score = 35 + ((combinedEra - 3.0) / 0.5) * (50 - 35);
  } else if (combinedEra <= 4.0) {
    score = 50 + ((combinedEra - 3.5) / 0.5) * (65 - 50);
  } else if (combinedEra <= 4.5) {
    score = 65 + ((combinedEra - 4.0) / 0.5) * (80 - 65);
  } else if (combinedEra <= 5.0) {
    score = 80 + ((combinedEra - 4.5) / 0.5) * (100 - 80);
  } else {
    score = 100;
  }

  return Math.round(score);
}
