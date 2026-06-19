# MLB Total Runs Screening Tool - Project Specification

## 1. Project Overview

The MLB Total Runs Screening Tool is a specialized screening utility designed to identify the strongest Over opportunities for MLB games by ranking them based on statistical likelihood of high total runs production. The tool focuses exclusively on screening games for Over 5.5, 6.5, 7.5, and 8.5 run total bets, with emphasis on building 2-leg and 3-leg parlay combinations.

## 2. Goals & Objectives

### Primary Goals
- Rank today's MLB games by likelihood of producing high total runs
- Identify the strongest Over opportunities across multiple run total thresholds
- Help users build optimal 2-leg and 3-leg multi-leg betting combinations
- Provide transparent scoring based on relevant statistical factors
- Deliver real-time, up-to-date scoring and recommendations

### Success Criteria
- Tool accurately identifies high-run games with measurable hit rate on Over bets
- Scoring methodology is reproducible and explainable
- Real-time data updates throughout the day
- Rankings refresh with latest available statistics
- Multi-leg combinations can be easily identified and tracked

## 3. Core Features (MVP Version 1.0)

### 3.1 Data Integration
- Fetch today's MLB games schedule and start times
- Retrieve starting pitcher information (ERA, season stats)
- Pull current season team statistics (runs scored/allowed)
- Fetch last 30-game rolling statistics per team
- Retrieve home/away split statistics
- Cache data for performance

### 3.2 Unified Scoring Engine
- Generate single run-production likelihood score (0-100) per game
- Convert single score to four threshold probabilities via calibration curves
- Output probabilities for Over 5.5, 6.5, 7.5, 8.5
- Support threshold filtering for user selections

### 3.3 Game Ranking
- Rank all daily games by run production score
- Display games with full threshold probabilities
- Show complete scoring factor breakdown for each game
- Support filtering/reordering by selected threshold

### 3.4 Multi-Leg Combination Suggestion
- Generate top 3 best 2-leg parlay combinations
- Generate top 3 best 3-leg parlay combinations
- Rank combinations by expected hit rate
- Support custom parlay building (manual game selection)
- Calculate parlay hit rate from individual probabilities

### 3.5 User Interface (Three Screens)
- Dashboard: Ranked games with threshold probabilities
- Matchup Analysis: Detailed scoring breakdown for one game
- Multi-Builder: Pre-calculated suggestions and custom builder
- Copy-to-clipboard action for selected parlay
- Threshold selector (Over 5.5/6.5/7.5/8.5)

### 3.6 Not Included in MVP
- Sportsbook odds estimation
- Parlay confirmation screen (copy action only)
- Live game score tracking
- User accounts or history
- Correlation calculations
- Historical accuracy metrics

## 4. Technical Architecture

### 4.1 Technology Stack
(To be determined)

Options under consideration:
- **Backend**: Python, Node.js, or Go
- **Frontend**: React, Vue, or Next.js
- **Database**: PostgreSQL, MongoDB, or similar
- **Data Sources**: MLB API or third-party services

### 4.2 System Components
- Data Fetcher: Retrieves game schedules, team stats, pitcher info
- Scoring Engine: Calculates Over likelihood scores
- Ranking Module: Ranks games and identifies multi-leg combinations
- Cache Layer: Stores frequently accessed data
- UI/Dashboard: Presents rankings and recommendations

## 5. Scoring Engine

### 5.0 MVP Architecture Decision (Version 1.0)

**Version 1.0 implements a single unified scoring engine with one set of weightings that produces four separate threshold outputs.**

This MVP approach prioritizes:
- Fast implementation and rapid validation
- Clear, maintainable code with minimal complexity
- Empirical calibration curves derived from historical backtesting
- Clear upgrade path to threshold-specific models in future versions

Each game receives one underlying run-production likelihood score (0-100), which is then converted to four separate threshold probabilities (Over 5.5, 6.5, 7.5, 8.5) using calibration curves established during backtesting.

**Future Enhancement (Version 1.1+):** After real-world validation and backtesting analysis, threshold-specific weighting adjustments may be added if analysis reveals that particular thresholds would benefit from different factor weights.

### 5.1 Unified Weighting Distribution (Version 1.0)

```
Run Production Score = (45% × Current Season Overs Perf) + (20% × Last 30 Games Trend) + (15% × Opposing Pitcher Quality) + (10% × Opposing Bullpen Quality) + (10% × Other Factors)
```

**Important:** This single formula generates one 0-100 score per game. The four threshold outputs (Over 5.5, 6.5, 7.5, 8.5) are derived from this single score using empirically-calibrated conversion curves established during backtesting.

### 5.2 Component Details

#### 1. Current Season Overs Performance (45%)

**Data Needed:**
- Overall Over hit rate for both teams this season
- Count of games where combined runs exceeded season median for each team
- Total games played in current season for both teams
- Home and away split data for Over rates

**Calculation:**
- For each team: Calculate overall Over hit rate (% of games with high run production)
- Combined matchup score: Average of both teams' overall Over rates
- Adjusted for home/away context using team-specific splits
- Normalized to 0-100 scale for consistency

**Why It Matters:**
- **Heaviest weight (45%)** reflects actual historical performance on run production
- Teams with consistently high-scoring games are more likely to contribute to Over outcomes
- Season-long data provides the most reliable baseline for future performance
- This single metric already incorporates most of the variance in game outcomes

---

#### 2. Last 30 Games Trend (20%)

**Data Needed:**
- Last 30 games played by each team (home and away combined)
- Total runs scored in each of those games
- Total runs allowed in each of those games

**Calculation:**
- For each team: Average total runs in last 30 games
- Combined matchup score: (Home team's 30-game avg + Away team's 30-game avg) / 2
- Compare against each run total threshold
- Score based on how often the 30-game avg exceeded the threshold

**Why It Matters:**
- **Moderate weight (20%)** captures recent momentum and form
- Teams may be trending up or down in run production within the season
- 30-game window balances recency with sufficient sample size
- Helps identify teams currently playing higher-scoring baseball vs. season average
- Accounts for mid-season roster changes, injuries, and adjustments

---

#### 3. Opposing Pitcher Quality (15%)

**Data Needed:**
- Starting pitcher ERA for each matchup
- Pitcher season statistics (runs allowed per game, strikeouts)
- League average ERA for context

**Calculation:**
- For each starting pitcher: Calculate ERA normalized against league average
- Higher ERA indicates pitcher allows more runs (favorable for Over)
- Score: (Pitcher ERA / League Avg ERA) * 100, capped at 0-100 scale
- Average the two pitchers' scores (home and away starters)
- Represents likelihood that opposing starters are weak vs. strong

**Why It Matters:**
- **Moderate weight (15%)** because it's the primary game-to-game variable
- Elite pitchers (sub-3.50 ERA) reduce Over likelihood; weak starters (5.00+ ERA) increase it
- This is the main factor that changes day-to-day, providing differentiation
- Pitcher matchups are well-understood and relatively predictable
- Captures offensive advantage/disadvantage in the matchup

---

#### 4. Opposing Bullpen Quality (10%)

**Data Needed:**
- Team bullpen ERA for each team
- Innings pitched by bullpen (to gauge workload)
- League average bullpen ERA for context

**Calculation:**
- For each team's bullpen: Calculate ERA normalized against league average
- Weaker bullpen (higher ERA) more likely to allow runs in later innings
- Score: (Bullpen ERA / League Avg ERA) * 100, capped at 0-100 scale
- Represents likelihood of runs given in later innings

**Why It Matters:**
- **Lower weight (10%)** because bullpen impact is secondary to starting pitchers
- High-run games often occur when relief pitchers struggle
- Less predictable than starter quality (more variability game-to-game)
- Important for Over 7.5+ but less critical for Over 5.5
- Should inform but not dominate the score

---

#### 5. Other Factors (10%)

**Data Included:**
- Ballpark factor adjustment (park index for runs)
- Home/away context weighting
- Recent injury or roster changes if tracked
- League-wide run environment trend (if applicable)

**Calculation:**
- Composite of smaller factors that don't warrant individual weighting
- Adjusts baseline score based on context and environment
- Prevents over-reliance on pitcher metrics alone

**Why It Matters:**
- **Lighter weight (10%)** for factors with lower predictive power individually
- Ballpark effects are real but relatively stable and often captured in team stats
- Prevents model from being too pitcher-focused
- Provides flexibility for future additions without restructuring weights

---

### 5.3 Threshold Score Conversion (Calibration Curves)

**Version 1.0 Approach:** One underlying run-production score is converted to four threshold-specific probabilities using empirically-derived calibration curves.

Calibration curves are established during backtesting by analyzing historical games:
- Games with Run Score 90: What were actual Over 5.5, 6.5, 7.5, 8.5 hit rates?
- Games with Run Score 80: Same analysis for all thresholds
- Games with Run Score 70, 60, 50, etc.: Same pattern

Example calibration curve (to be validated during backtesting):
- Run Score 90 -> Over 5.5: 92%, Over 6.5: 87%, Over 7.5: 78%, Over 8.5: 61%
- Run Score 80 -> Over 5.5: 85%, Over 6.5: 77%, Over 7.5: 65%, Over 8.5: 48%
- Run Score 70 -> Over 5.5: 75%, Over 6.5: 65%, Over 7.5: 52%, Over 8.5: 35%

**This approach ensures:**
- Threshold probabilities reflect actual historical relationships
- No threshold is arbitrarily weighted in the underlying formula
- User sees meaningful threshold-specific likelihoods
- Single underlying score remains simple to maintain
- Clear path to threshold-specific tuning in future versions

---

### 5.4 Score Interpretation

**Underlying Run Production Score (0-100):**
- 80-100: Very strong High-Run candidate
- 60-79: Good High-Run candidate
- 40-59: Neutral
- 20-39: Below-average High-Run candidate
- 0-19: Weak High-Run candidate

**Threshold-Specific Probabilities (converted from Run Score):**
User sees four probabilities (e.g., 92% Over 5.5, 78% Over 7.5) that reflect the likelihood of exceeding each threshold, derived from the underlying score and calibration curves.

---

### 5.5 Multi-Leg Parlay Scoring

For 2-leg and 3-leg combinations:
- Individual game Run Production Scores are used as the base ranking
- For a specific threshold parlay (e.g., Over 7.5 x 2), use the threshold-specific probabilities
- Correlation analysis applied to identify independent games (low correlation preferred)
- Combo score: Weighted combination of individual threshold probabilities
- Present combinations ranked by combo score for the selected threshold

---

## 6. Data Sources & Recommended Providers

### Required Data
- Today's MLB game schedule and start times
- Team season statistics (runs scored and allowed)
- Last 30 game trend data per team
- Home/Away split statistics
- Starting pitcher information (ERA, runs allowed per game)

### 6.1 Primary Recommended Data Source: MLB-StatsAPI

**Why MLB-StatsAPI:**
- Free, open-source API provided by MLB Advanced Media
- Official MLB data with real-time updates
- No authentication required for basic data access
- Comprehensive coverage of all scoring-related metrics
- Reliable uptime and response times
- Well-documented community support

**Covered Data:**
- ✅ Game schedule and start times
- ✅ Team season statistics (runs, ERA, etc.)
- ✅ Historical game results (30-game trends)
- ✅ Home/away split statistics
- ✅ Starting pitcher information (ERA, season stats)
- ✅ Live game updates and real-time scoring

**API Endpoints to Use:**
- `/api/v1/teams/{teamId}/stats` - Team statistics
- `/api/v1/schedule?date={date}` - Games for a specific date
- `/api/v1/people/{personId}` - Pitcher statistics
- `/api/v1/game/{gamePk}/linescore` - Game scores and totals

---

### 6.2 Secondary Data Sources (Fallback/Supplementary)

#### Baseball-Reference.com (via Web Scraping)

**When to Use:**
- If MLB-StatsAPI is unavailable
- For historical season comparisons
- For more granular home/away splits by opponent

**Strengths:**
- Comprehensive historical data
- Detailed split statistics
- Easy-to-parse HTML tables

**Weaknesses:**
- Requires web scraping (slower, less reliable)
- Terms of service may restrict automated access
- Not real-time

---

#### ESPN MLB API (Secondary Option)

**When to Use:**
- As backup if MLB-StatsAPI experiences outages
- For alternative data validation

**Strengths:**
- Reliable service from established provider
- Real-time game updates

**Weaknesses:**
- Less official than MLB-StatsAPI
- API documentation less comprehensive
- May require rate limiting awareness

---

### 6.3 Recommended Data Caching Strategy

**Daily Refresh Cycle:**
- **Morning (6:00 AM)**: Fetch game schedule for the day ahead
- **Morning (6:30 AM)**: Fetch starting pitchers and lineups
- **Throughout Day**: Poll every 15-30 minutes for:
  - Latest team statistics
  - 30-game rolling averages
  - Updated home/away splits
- **Evening**: Final data refresh after all games complete
- **Nightly**: Archive game results for historical reference

**Cache Storage:**
- In-memory cache for today's games and scores (fast access)
- Local database for 30-game history per team
- Local storage for season statistics and splits
- Archive storage for historical validation data

**Cache Invalidation:**
- Refresh pitching data if there are lineup changes
- Refresh team stats after each game completes
- Recalculate scores after each data refresh
- Clear and rebuild 30-game trend data nightly

---

### 6.4 Data Quality & Error Handling

**Validation Steps:**
- Verify all teams have data for each game
- Check that pitcher data exists for all matchups
- Validate that historical data meets minimum sample requirements (min 10 games for 30-game trends)
- Flag missing or incomplete data for manual review

**Fallback Strategy:**
- If pitcher data unavailable: Use team season averages
- If 30-game data insufficient: Use full season data with warning
- If real-time updates fail: Use last successful data point with timestamp
- If data source down: Alert user and skip scoring until restored

## 7. Performance Requirements

- Data refresh within 5 minutes of latest statistics
- Game ranking computation completes within 10 seconds
- Dashboard loads within 2 seconds
- Support up to 30 concurrent games per day

## 8. Testing Strategy

- Unit tests for scoring algorithm accuracy
- Historical backtesting against past seasons
- Manual testing of rankings vs. actual game outcomes
- Daily tracking of Over hit rate and accuracy

## 9. Deployment & DevOps

- Local deployment for initial development
- Cloud hosting option for future scalability
- Automated daily data refresh
- Alert system for data fetch failures

## 10. Out of Scope

- Exact score prediction
- Player injury tracking or advanced player-level analytics
- Integration with betting platforms or real money
- Weather data integration
- Historical multi-year trend analysis beyond 30-game windows
