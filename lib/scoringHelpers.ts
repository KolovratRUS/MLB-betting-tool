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
 * Ballpark run-environment scores (0-100) — PARK/ENVIRONMENT PROXY.
 *
 * IMPORTANT: This is a PARK / RUN-ENVIRONMENT PROXY, not a live weather feed
 * or current-season Statcast park-factor API. Each MLB ballpark is assigned a
 * static score derived from publicly known historical run-scoring tendencies
 * (think of ~50 as league-neutral run scoring):
 *   - Hitter-friendly parks (Coors Field) score high  -> more runs / over-friendly
 *   - Pitcher-friendly parks (Oracle Park, Petco)      score low
 *   - Neutral parks land in roughly the 50-65 band
 *
 * The ballpark is identified by the HOME team, which is always available from
 * the MLB schedule (no extra/paid API call needed). Keys are matched as
 * case-insensitive substrings of the home team name, so both the full MLB API
 * name ("Colorado Rockies") and the short mock name ("Rockies") resolve.
 */
const PARK_ENVIRONMENT: Array<{ keyword: string; park: string; score: number }> = [
  // Strong hitter's parks
  { keyword: 'rockies', park: 'Coors Field', score: 95 },
  { keyword: 'reds', park: 'Great American Ball Park', score: 70 },
  { keyword: 'red sox', park: 'Fenway Park', score: 67 },
  { keyword: 'orioles', park: 'Oriole Park at Camden Yards', score: 65 },
  { keyword: 'phillies', park: 'Citizens Bank Park', score: 64 },
  // Mildly hitter-leaning
  { keyword: 'royals', park: 'Kauffman Stadium', score: 60 },
  { keyword: 'rangers', park: 'Globe Life Field', score: 60 },
  { keyword: 'diamondbacks', park: 'Chase Field', score: 60 },
  { keyword: 'yankees', park: 'Yankee Stadium', score: 60 },
  { keyword: 'cubs', park: 'Wrigley Field', score: 58 },
  { keyword: 'braves', park: 'Truist Park', score: 58 },
  { keyword: 'blue jays', park: 'Rogers Centre', score: 57 },
  { keyword: 'brewers', park: 'American Family Field', score: 56 },
  { keyword: 'white sox', park: 'Rate Field', score: 56 },
  // Roughly neutral
  { keyword: 'nationals', park: 'Nationals Park', score: 55 },
  { keyword: 'twins', park: 'Target Field', score: 55 },
  { keyword: 'astros', park: 'Daikin Park', score: 55 },
  { keyword: 'cardinals', park: 'Busch Stadium', score: 53 },
  { keyword: 'angels', park: 'Angel Stadium', score: 52 },
  { keyword: 'mets', park: 'Citi Field', score: 51 },
  { keyword: 'dodgers', park: 'Dodger Stadium', score: 50 },
  { keyword: 'rays', park: 'Tropicana Field', score: 50 },
  { keyword: 'guardians', park: 'Progressive Field', score: 50 },
  { keyword: 'athletics', park: 'Sutter Health Park', score: 50 },
  // Pitcher-leaning
  { keyword: 'tigers', park: 'Comerica Park', score: 49 },
  { keyword: 'pirates', park: 'PNC Park', score: 48 },
  { keyword: 'marlins', park: 'loanDepot park', score: 47 },
  { keyword: 'padres', park: 'Petco Park', score: 45 },
  { keyword: 'giants', park: 'Oracle Park', score: 44 },
  { keyword: 'mariners', park: 'T-Mobile Park', score: 44 },
];

/** Score used when the home team's ballpark is unknown (treated as neutral). */
const NEUTRAL_PARK_SCORE = 55;

/**
 * Calculate the overall Run Score (Step 9) as a weighted blend of the five
 * scoring factors. Each factor is already on a 0-100 scale, so the weighted
 * sum is also 0-100.
 *
 * Weights:
 *   - Season Overs performance .... 45%
 *   - Last 30 games trend ......... 20%
 *   - Opposing pitcher quality .... 15%
 *   - Opposing bullpen quality .... 10%
 *   - Other factors (park env.) ... 10%
 *
 * @param factors The five 0-100 scoring-breakdown factor values
 * @returns Run Score (0-100), rounded to the nearest whole number
 */
export function calculateRunScore(factors: {
  seasonOversPerformance: number;
  last30GamesTrend: number;
  opposingPitcherQuality: number;
  opposingBullpenQuality: number;
  otherFactors: number;
}): number {
  const runScore =
    factors.seasonOversPerformance * 0.45 +
    factors.last30GamesTrend * 0.2 +
    factors.opposingPitcherQuality * 0.15 +
    factors.opposingBullpenQuality * 0.1 +
    factors.otherFactors * 0.1;

  return Math.round(runScore);
}

/**
 * Calculate the "Other Factors" score (Step 8) from the ballpark run environment.
 *
 * Replaces the former mock `otherFactors` value with a real, pre-game-derived
 * park/environment proxy. The ballpark is determined by the home team. Higher
 * score = more run-friendly environment (over-leaning); lower = pitcher-friendly.
 *
 * See PARK_ENVIRONMENT for the proxy nature and what remains approximate
 * (no live weather, static historical factors).
 *
 * @param game Game object (uses game.homeTeam to identify the ballpark)
 * @returns Park/environment score (0-100)
 */
export function calculateOtherFactors(game: Game): number {
  const home = (game.homeTeam || '').toLowerCase();
  const match = PARK_ENVIRONMENT.find((p) => home.includes(p.keyword));

  const score = match ? match.score : NEUTRAL_PARK_SCORE;
  const parkName = match ? match.park : 'Unknown park (neutral default)';

  // Log for verification
  console.log(
    `[otherFactors] ${game.awayTeam} @ ${game.homeTeam}: ` +
    `park=${parkName}, environmentScore=${score} (park/environment proxy)`
  );

  return score;
}

/**
 * Calculate bullpen quality score from team OVER-RATE percentages.
 *
 * TEMPORARY PROXY: until true bullpen-only stats are wired in, the team
 * `oversRate` percentage is used as a stand-in for bullpen/pitching quality.
 * Inputs are therefore PERCENTAGES (0-100), NOT ERA values.
 *
 * Higher over-rate (more games go over) → higher score (more over-friendly).
 * Lower over-rate → lower score (less over-friendly).
 *
 * Linear interpolation between these calibration points:
 *   <= 30% → 35
 *      35% → 50
 *      40% → 65
 *      45% → 80
 *   >= 50% → 95
 *
 * @param homeTeamOverRate Home team over-rate percentage (0-100), or null
 * @param awayTeamOverRate Away team over-rate percentage (0-100), or null
 * @returns Bullpen quality score (0-100)
 */
export function calculateBullpenQuality(
  homeTeamOverRate: number | null,
  awayTeamOverRate: number | null
): number {
  // Neutral default (~38% over-rate maps to a mid-range score) when data missing.
  const defaultOverRate = 38;
  const homeRate = homeTeamOverRate ?? defaultOverRate;
  const awayRate = awayTeamOverRate ?? defaultOverRate;

  // Combined over-rate (average of both teams)
  const combinedOverRate = (homeRate + awayRate) / 2;

  // Map combined over-rate percentage to score using linear interpolation
  let score: number;

  if (combinedOverRate <= 30) {
    score = 35;
  } else if (combinedOverRate <= 35) {
    // Interpolate between 30% (35) and 35% (50)
    score = 35 + ((combinedOverRate - 30) / 5) * (50 - 35);
  } else if (combinedOverRate <= 40) {
    // Interpolate between 35% (50) and 40% (65)
    score = 50 + ((combinedOverRate - 35) / 5) * (65 - 50);
  } else if (combinedOverRate <= 45) {
    // Interpolate between 40% (65) and 45% (80)
    score = 65 + ((combinedOverRate - 40) / 5) * (80 - 65);
  } else if (combinedOverRate <= 50) {
    // Interpolate between 45% (80) and 50% (95)
    score = 80 + ((combinedOverRate - 45) / 5) * (95 - 80);
  } else {
    // 50%+ over-rate caps at 95
    score = 95;
  }

  const roundedScore = Math.round(score);

  // Log for verification
  console.log(
    `[bullpen] homeRate=${homeRate}%, awayRate=${awayRate}%, ` +
    `combinedRate=${combinedOverRate.toFixed(1)}%, bullpenScore=${roundedScore} (over-rate proxy)`
  );

  return roundedScore;
}
