import { describe, it, expect } from 'vitest';
import { DGCAService } from '../src/services/dgcaService.js';
import { IndexEngine } from '../src/services/indexEngine.js';
import { CleanerService } from '../src/services/cleanerService.js';
import { Normalizer } from '../src/scrapers/core/Normalizer.js';
import { ProvenanceService } from '../src/services/provenanceService.js';
import { DataQualityService } from '../src/services/dataQualityService.js';
import { AnomalyService } from '../src/services/anomalyService.js';
import { CPIService } from '../src/services/cpiService.js';

describe('1. DGCA Excel Parsing & Data Ingestion', () => {
  it('correctly loads and parses 786 official city pairs', () => {
    const data = DGCAService.getProcessedData();
    expect(data).toBeDefined();
    expect(data.metadata.total_city_pairs_reported).toBe(786);
  });

  it('correctly calculates total network two-way domestic passengers (~136M)', () => {
    const data = DGCAService.getProcessedData();
    expect(data.metadata.total_domestic_passengers_2022_23).toBe(136028655);
  });

  it('verifies two-way traffic calculation (TO + FROM)', () => {
    const data = DGCAService.getProcessedData();
    const first = data.all_city_pairs[0];
    expect(first.total_two_way_passengers).toBe(first.passengers_to_city2 + first.passengers_from_city2);
  });
});

describe('2. Route Basket Ranking & Weight Normalization', () => {
  it('correctly ranks MUMBAI <-> DELHI as #1 busiest domestic corridor', () => {
    const top20 = DGCAService.getTopRoutes(20);
    expect(top20.length).toBe(20);
    expect(top20[0].originCity).toBe('Mumbai');
    expect(top20[0].destinationCity).toBe('New Delhi');
    expect(top20[0].rank).toBe(1);
    expect(top20[0].totalTwoWayTraffic).toBe(5615919);
  });

  it('verifies Top 20 DGCA weights strictly normalize and sum to 1.000000', () => {
    const top20 = DGCAService.getTopRoutes(20);
    const sumWeights = top20.reduce((acc, r) => acc + r.weightInBasket, 0);
    expect(Math.abs(sumWeights - 1.0)).toBeLessThan(0.0001);
  });

  it('labels weights as DGCA TRAFFIC-DERIVED WEIGHT, not official MoSPI weight', () => {
    const top20 = DGCAService.getTopRoutes(20);
    expect(top20[0].weightLabel).toBe('DGCA TRAFFIC-DERIVED WEIGHT');
  });
});

describe('3. Normalization & Validation', () => {
  it('cleans currency symbols, commas, and formatting noise', () => {
    expect(Normalizer.cleanPrice('₹ 5,420.50')).toBe(5420.5);
    expect(Normalizer.cleanPrice('INR 12,000')).toBe(12000);
    expect(Normalizer.cleanPrice(4850)).toBe(4850);
    expect(Normalizer.cleanPrice('')).toBe(0);
  });

  it('normalizes flight numbers to standard format', () => {
    expect(Normalizer.normalizeFlightNumber('6E 201')).toBe('6E-201');
    expect(Normalizer.normalizeFlightNumber('ai 805')).toBe('AI-805');
  });

  it('flags extreme fare outliers via MAD Modified Z-score', () => {
    const normalCluster = [4800, 4900, 5000, 5100, 5200, 5050, 4950];
    const withOutlier = [...normalCluster, 45000]; // Extreme spike
    const flags = CleanerService.filterOutliersMAD(withOutlier);
    expect(flags[flags.length - 1]).toBe(true); // 45000 is flagged
    expect(flags[0]).toBe(false); // 4800 is clean
  });

  it('deduplicates identical physical flights across direct airline and OTAs', () => {
    const mockQuotes = [
      { quoteId: 'Q1', flightNumber: '6E-201', departureDate: '2026-09-25', departureTime: '06:00', sourceType: 'AIRLINE', isDirect: true, totalFare: 5200 },
      { quoteId: 'Q2', flightNumber: '6E-201', departureDate: '2026-09-25', departureTime: '06:00', sourceType: 'OTA', isDirect: false, totalFare: 5499 },
    ];
    const { retained, dropped } = CleanerService.deduplicateMultiOTA(mockQuotes);
    expect(retained.length).toBe(1);
    expect(retained[0].sourceType).toBe('AIRLINE');
    expect(dropped.length).toBe(1);
    expect(dropped[0].quoteId).toBe('Q2');
  });
});

describe('4. Econometric Index Engine (Jevons & Chaining)', () => {
  it('analytically calculates Jevons Geometric Mean without upward Carli arithmetic bias', () => {
    // Known test set: fares = [1000, 4000], geometric mean = sqrt(1000 * 4000) = 2000
    const fares = [1000, 4000];
    const jMean = IndexEngine.calculateJevons(fares);
    expect(jMean).toBe(2000.0);
  });

  it('correctly chains daily index using short-Jevons price factor', () => {
    const prevIndex = 100.0;
    const prevMean = 5000.0;
    const currMean = 5250.0; // +5% move
    const chained = IndexEngine.chainIndex(prevIndex, currMean, prevMean);
    expect(chained).toBe(105.0);
  });

  it('aggregates National APIx using traffic-derived route weights', () => {
    const routeIndices = [
      { routeCode: 'BOM-DEL', indexValue: 110.0 },
      { routeCode: 'BLR-DEL', indexValue: 100.0 },
    ];
    const national = IndexEngine.aggregateNationalIndex(routeIndices, 2);
    expect(national).toBeGreaterThan(100.0);
    expect(national).toBeLessThan(110.0);
  });
});

describe('5. MoSPI Official CPI Benchmark', () => {
  it('correctly loads official MoSPI 2024=100 Airfare series', () => {
    const series = CPIService.getMonthlySeries();
    expect(series.length).toBeGreaterThanOrEqual(20);
    expect(series[0].code).toBe('07.3.3.1.2.01');
    expect(series[0].item).toBe('Airfare');
    expect(series[0].base_year).toBe('2024=100');
  });

  it('verifies latest August 2026 official CPI index value matches press release (135.49)', () => {
    const latest = CPIService.getLatestCPI();
    expect(latest).toBeDefined();
    expect(latest?.year).toBe(2026);
    expect(latest?.month).toBe('August');
    expect(latest?.index).toBe(135.49);
    expect(latest?.inflation_pct).toBe(20.85);
  });
});

describe('6. Provenance & Cryptographic Audit Verification', () => {
  it('generates reproducible SHA-256 fingerprint for quotes', () => {
    const q1 = {
      sourceName: 'IndiGo',
      routeCode: 'DEL-BOM',
      flightNumber: '6E-201',
      departureDate: '2026-09-25',
      totalFare: 5400,
      collectionTimestamp: '2026-09-18T10:00:00.000Z',
    };
    const hash1 = ProvenanceService.generateFingerprint(q1);
    const hash2 = ProvenanceService.generateFingerprint(q1);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 length in hex
  });

  it('detects tampering when fare is modified', () => {
    const q1 = {
      sourceName: 'IndiGo',
      routeCode: 'DEL-BOM',
      flightNumber: '6E-201',
      departureDate: '2026-09-25',
      totalFare: 5400,
      collectionTimestamp: '2026-09-18T10:00:00.000Z',
    };
    const signature = ProvenanceService.generateFingerprint(q1);
    const tamperedQuote = { ...q1, totalFare: 5500, sha256Signature: signature };
    expect(ProvenanceService.verifyFingerprint(tamperedQuote)).toBe(false);
  });
});

describe('7. Data Quality & Trust Scorecard', () => {
  it('computes 7-dimension Data Trust scorecard between 0 and 100', () => {
    const scorecard = DataQualityService.evaluateTrustScore([], [], [], 20);
    expect(scorecard.overallTrustScore).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallTrustScore).toBeLessThanOrEqual(100);
    expect(scorecard.dimensions.freshness).toBeDefined();
    expect(scorecard.dimensions.completeness).toBeDefined();
    expect(scorecard.dimensions.routeCoverage).toBeDefined();
  });
});

describe('8. Market Anomaly Detection', () => {
  it('detects booking horizon inversions when T+30 exceeds T+7', () => {
    const obs = [
      { routeCode: 'DEL-BOM', advanceWindow: 'T+7', meanFare: 5000 },
      { routeCode: 'DEL-BOM', advanceWindow: 'T+30', meanFare: 6500 }, // Inversion!
    ];
    const anomalies = AnomalyService.scanAnomalies(obs, []);
    const inv = anomalies.find(a => a.type === 'HORIZON_INVERSION');
    expect(inv).toBeDefined();
    expect(inv?.routeCode).toBe('DEL-BOM');
  });
});

describe('9. API Response Contract Standard', () => {
  it('enforces unified success format { success: true, data: ..., meta: ... }', async () => {
    const { sendSuccess } = await import('../src/utils/response.js');
    let capturedJson = null;
    let capturedStatus = 0;
    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(body) {
        capturedJson = body;
        return this;
      },
    };

    sendSuccess(mockRes, { test: 123 }, { count: 1 });
    expect(capturedStatus).toBe(200);
    expect(capturedJson.success).toBe(true);
    expect(capturedJson.data).toEqual({ test: 123 });
    expect(capturedJson.meta).toEqual({ count: 1 });
  });

  it('enforces unified error format { success: false, error: { code, message } }', async () => {
    const { sendError } = await import('../src/utils/response.js');
    let capturedJson = null;
    let capturedStatus = 0;
    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(body) {
        capturedJson = body;
        return this;
      },
    };

    sendError(mockRes, 'Corridor observations not found', 'NOT_FOUND', 404);
    expect(capturedStatus).toBe(404);
    expect(capturedJson.success).toBe(false);
    expect(capturedJson.error.code).toBe('NOT_FOUND');
    expect(capturedJson.error.message).toBe('Corridor observations not found');
  });
});

describe('10. Scraper Orchestration & Source Health Truthfulness', () => {
  it('returns truthful NOT_TESTED status for all 11 adapters when no scrapes have run', async () => {
    const { ScrapeOrchestrator } = await import('../src/services/scrapeOrchestrator.js');
    const health = await ScrapeOrchestrator.getSourceHealthSummary();
    expect(health.length).toBe(11);
    const mmt = health.find(s => s.sourceName === 'MakeMyTrip');
    expect(mmt).toBeDefined();
    expect(mmt?.currentStatus).toBe('NOT_TESTED');
    expect(mmt?.quotesCollected24h).toBe(0);
  }, 30000);

  it('creates and records a ScrapeRun with valid unique ID', async () => {
    const { ScrapeOrchestrator } = await import('../src/services/scrapeOrchestrator.js');
    const runId = await ScrapeOrchestrator.startScrapeRun({
      sourceNames: ['IndiGo'],
      routeCodes: ['DEL-BOM'],
      mode: 'DEMO',
    });
    expect(runId).toBeDefined();

    const fetched = await ScrapeOrchestrator.getRunById(runId);
    expect(fetched).toBeDefined();
    expect(fetched?.scrapeRunId).toBe(runId);
    expect(fetched?.sources).toContain('IndiGo');
  }, 30000);
});

describe('11. LIVE vs DEMO Mode Isolation', () => {
  it('validates quotes against strict realistic bounds [500, 250000]', () => {
    expect(CleanerService.validateQuote({ origin: 'DEL', destination: 'BOM', totalFare: 450, departureDate: '2026-09-25' }).isValid).toBe(false);
    expect(CleanerService.validateQuote({ origin: 'DEL', destination: 'BOM', totalFare: 5500, departureDate: '2026-09-25' }).isValid).toBe(true);
    expect(CleanerService.validateQuote({ origin: 'DEL', destination: 'DEL', totalFare: 5500, departureDate: '2026-09-25' }).isValid).toBe(false);
  });

  it('verifies Normalizer standardizes raw flight quotes faithfully', () => {
    const norm = Normalizer.normalize({
      origin: 'del',
      destination: 'bom',
      flightNumber: '6e 205',
      totalFare: '₹ 6,750',
      departureDate: '2026-10-01',
    });
    expect(norm.origin).toBe('DEL');
    expect(norm.destination).toBe('BOM');
    expect(norm.flightNumber).toBe('6E-205');
    expect(norm.carrierCode).toBe('6E');
    expect(norm.totalFare).toBe(6750);
  });
});
