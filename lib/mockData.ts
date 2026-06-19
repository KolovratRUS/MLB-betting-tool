export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  runScore: number;
  thresholds: {
    over55: number;
    over65: number;
    over75: number;
    over85: number;
  };
  homeTeamStats: {
    oversRate: number;
    last30AvgRuns: number;
    season: string;
  };
  awayTeamStats: {
    oversRate: number;
    last30AvgRuns: number;
    season: string;
  };
  homePitcher: {
    name: string;
    era: number;
  };
  awayPitcher: {
    name: string;
    era: number;
  };
  scoringBreakdown: {
    seasonOversPerformance: number;
    last30GamesTrend: number;
    opposingPitcherQuality: number;
    opposingBullpenQuality: number;
    otherFactors: number;
  };
}

export const mockGames: Game[] = [
  {
    id: '1',
    homeTeam: 'Red Sox',
    awayTeam: 'Yankees',
    time: '7:05 PM',
    runScore: 78,
    thresholds: {
      over55: 85,
      over65: 77,
      over75: 65,
      over85: 48,
    },
    homeTeamStats: {
      oversRate: 62,
      last30AvgRuns: 5.8,
      season: '60 games played',
    },
    awayTeamStats: {
      oversRate: 58,
      last30AvgRuns: 5.9,
      season: '61 games played',
    },
    homePitcher: {
      name: 'Rodon',
      era: 3.21,
    },
    awayPitcher: {
      name: 'Sale',
      era: 3.45,
    },
    scoringBreakdown: {
      seasonOversPerformance: 80,
      last30GamesTrend: 75,
      opposingPitcherQuality: 72,
      opposingBullpenQuality: 68,
      otherFactors: 65,
    },
  },
  {
    id: '2',
    homeTeam: 'Rockies',
    awayTeam: 'Padres',
    time: '3:10 PM',
    runScore: 72,
    thresholds: {
      over55: 78,
      over65: 68,
      over75: 55,
      over85: 38,
    },
    homeTeamStats: {
      oversRate: 65,
      last30AvgRuns: 6.2,
      season: '58 games played',
    },
    awayTeamStats: {
      oversRate: 52,
      last30AvgRuns: 5.1,
      season: '59 games played',
    },
    homePitcher: {
      name: 'Freeland',
      era: 4.12,
    },
    awayPitcher: {
      name: 'Musgrove',
      era: 2.98,
    },
    scoringBreakdown: {
      seasonOversPerformance: 75,
      last30GamesTrend: 70,
      opposingPitcherQuality: 68,
      opposingBullpenQuality: 62,
      otherFactors: 70,
    },
  },
  {
    id: '3',
    homeTeam: 'Astros',
    awayTeam: 'Mariners',
    time: '10:10 PM',
    runScore: 68,
    thresholds: {
      over55: 72,
      over65: 62,
      over75: 48,
      over85: 32,
    },
    homeTeamStats: {
      oversRate: 58,
      last30AvgRuns: 5.5,
      season: '62 games played',
    },
    awayTeamStats: {
      oversRate: 51,
      last30AvgRuns: 4.9,
      season: '61 games played',
    },
    homePitcher: {
      name: 'Verlander',
      era: 3.82,
    },
    awayPitcher: {
      name: 'Gilbert',
      era: 3.15,
    },
    scoringBreakdown: {
      seasonOversPerformance: 70,
      last30GamesTrend: 65,
      opposingPitcherQuality: 60,
      opposingBullpenQuality: 58,
      otherFactors: 60,
    },
  },
  {
    id: '4',
    homeTeam: 'Dodgers',
    awayTeam: 'Padres',
    time: '9:40 PM',
    runScore: 65,
    thresholds: {
      over55: 68,
      over65: 58,
      over75: 45,
      over85: 28,
    },
    homeTeamStats: {
      oversRate: 55,
      last30AvgRuns: 5.3,
      season: '61 games played',
    },
    awayTeamStats: {
      oversRate: 52,
      last30AvgRuns: 5.1,
      season: '59 games played',
    },
    homePitcher: {
      name: 'Yamamoto',
      era: 3.28,
    },
    awayPitcher: {
      name: 'Snell',
      era: 3.41,
    },
    scoringBreakdown: {
      seasonOversPerformance: 65,
      last30GamesTrend: 60,
      opposingPitcherQuality: 55,
      opposingBullpenQuality: 52,
      otherFactors: 55,
    },
  },
  {
    id: '5',
    homeTeam: 'Rays',
    awayTeam: 'Orioles',
    time: '1:10 PM',
    runScore: 62,
    thresholds: {
      over55: 62,
      over65: 52,
      over75: 40,
      over85: 25,
    },
    homeTeamStats: {
      oversRate: 48,
      last30AvgRuns: 4.8,
      season: '60 games played',
    },
    awayTeamStats: {
      oversRate: 54,
      last30AvgRuns: 5.2,
      season: '61 games played',
    },
    homePitcher: {
      name: 'King',
      era: 3.65,
    },
    awayPitcher: {
      name: 'Cortes',
      era: 3.92,
    },
    scoringBreakdown: {
      seasonOversPerformance: 60,
      last30GamesTrend: 55,
      opposingPitcherQuality: 50,
      opposingBullpenQuality: 48,
      otherFactors: 50,
    },
  },
  {
    id: '6',
    homeTeam: 'Royals',
    awayTeam: 'Twins',
    time: '8:10 PM',
    runScore: 58,
    thresholds: {
      over55: 55,
      over65: 45,
      over75: 32,
      over85: 18,
    },
    homeTeamStats: {
      oversRate: 46,
      last30AvgRuns: 4.5,
      season: '59 games played',
    },
    awayTeamStats: {
      oversRate: 50,
      last30AvgRuns: 4.8,
      season: '61 games played',
    },
    homePitcher: {
      name: 'Lorenzen',
      era: 4.15,
    },
    awayPitcher: {
      name: 'Sonny Gray',
      era: 2.88,
    },
    scoringBreakdown: {
      seasonOversPerformance: 55,
      last30GamesTrend: 50,
      opposingPitcherQuality: 45,
      opposingBullpenQuality: 42,
      otherFactors: 45,
    },
  },
  {
    id: '7',
    homeTeam: 'White Sox',
    awayTeam: 'Guardians',
    time: '7:10 PM',
    runScore: 52,
    thresholds: {
      over55: 48,
      over65: 38,
      over75: 25,
      over85: 12,
    },
    homeTeamStats: {
      oversRate: 42,
      last30AvgRuns: 4.2,
      season: '60 games played',
    },
    awayTeamStats: {
      oversRate: 48,
      last30AvgRuns: 4.6,
      season: '61 games played',
    },
    homePitcher: {
      name: 'Cease',
      era: 3.88,
    },
    awayPitcher: {
      name: 'McKenzie',
      era: 3.52,
    },
    scoringBreakdown: {
      seasonOversPerformance: 50,
      last30GamesTrend: 45,
      opposingPitcherQuality: 40,
      opposingBullpenQuality: 38,
      otherFactors: 40,
    },
  },
  {
    id: '8',
    homeTeam: 'Giants',
    awayTeam: 'Braves',
    time: '10:15 PM',
    runScore: 55,
    thresholds: {
      over55: 52,
      over65: 42,
      over75: 30,
      over85: 15,
    },
    homeTeamStats: {
      oversRate: 45,
      last30AvgRuns: 4.7,
      season: '61 games played',
    },
    awayTeamStats: {
      oversRate: 56,
      last30AvgRuns: 5.3,
      season: '60 games played',
    },
    homePitcher: {
      name: 'Cobb',
      era: 3.75,
    },
    awayPitcher: {
      name: 'Sale',
      era: 3.12,
    },
    scoringBreakdown: {
      seasonOversPerformance: 52,
      last30GamesTrend: 48,
      opposingPitcherQuality: 42,
      opposingBullpenQuality: 40,
      otherFactors: 42,
    },
  },
];
