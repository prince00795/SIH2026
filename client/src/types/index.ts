export type BadgeType =
  | 'OFFICIAL'
  | 'OFFICIAL_DERIVED'
  | 'LIVE_COLLECTED'
  | 'PROJECT_DERIVED'
  | 'DEMO'
  | 'UNAVAILABLE';

export interface INationalAPIxData {
  status: string;
  badge: BadgeType;
  mode: 'LIVE' | 'DEMO';
  warning?: string;
  notice?: string;
  currentNationalAPIx: number;
  dailyChangePct: number;
  weeklyChangePct: number;
  monthlyChangePct: number;
  asOfDate: string;
  routesMonitoredCount: number;
  methodology: string;
  weightVersion: string;
  timeSeries: Array<{
    date: string;
    indexValue: number;
    shortJevonsFactor: number;
    sampleQuotesCount: number;
    horizons?: {
      'T+1': number;
      'T+7': number;
      'T+15': number;
      'T+30': number;
      'T+45': number;
    };
  }>;
}

export interface IBasketRoute {
  routeCode: string;
  originCity: string;
  destinationCity: string;
  originIATA: string;
  destinationIATA: string;
  passengersTo: number;
  passengersFrom: number;
  totalTwoWayTraffic: number;
  rank: number;
  weightInBasket: number;
  networkSharePct: number;
  weightLabel: string;
}

export interface ISourceHealthItem {
  sourceName: string;
  sourceType: 'AIRLINE' | 'OTA';
  portalUrl: string;
  currentStatus: 'LIVE' | 'PARTIAL' | 'BLOCKED' | 'UNAVAILABLE' | 'ERROR' | 'DEMO' | 'NOT_CONFIGURED';
  lastAttemptAt: string;
  lastSuccessAt: string;
  successCount24h: number;
  failureCount24h: number;
  avgLatencyMs: number;
  quotesCollected24h: number;
  ethicalControls: {
    rateLimiting: string;
    robotsTxtCompliant: boolean;
    stealthEvasionUsed: boolean;
  };
}

export interface ICPIComparisonItem {
  month: string;
  monthName: string;
  officialMoSPIIndex: number;
  officialYoYInflationPct: number | null;
  projectDerivedAPIx: number | null;
  spread: number | null;
}

export interface IHeatmapRow {
  routeCode: string;
  originCity: string;
  destinationCity: string;
  rank: number;
  weightInBasket: number;
  windows: Record<string, { fare: number; status: 'SURGE' | 'ELEVATED' | 'NORMAL' | 'DISCOUNTED' }>;
}

export interface IMarketAnomalyItem {
  anomalyId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  routeCode: string;
  title: string;
  description: string;
  observedMetric: string;
  observedValue: number;
  expectedThreshold: number;
  detectedAt: string;
}

export interface IDataQualityScorecard {
  overallTrustScore: number;
  rating: string;
  asOfDate: string;
  dimensions: Record<string, { score: number; weight: number; description: string }>;
  metrics: Record<string, number>;
}
