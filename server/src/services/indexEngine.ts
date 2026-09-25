import { DGCAService } from './dgcaService.js';

export interface IFareQuoteInput {
  routeCode: string;
  advanceWindow: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';
  totalFare: number;
}

export interface IElementaryCellResult {
  routeCode: string;
  advanceWindow: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';
  sampleSize: number;
  jevonsMeanFare: number;
}

export interface IRouteAPIxResult {
  routeCode: string;
  originCity: string;
  destinationCity: string;
  rank: number;
  dgcaWeight: number;
  horizons: Record<string, {
    meanFare: number;
    indexValue: number;
    sampleSize: number;
  }>;
  compositeRouteIndex: number;
}

export interface INationalAPIxResult {
  date: string;
  nationalCompositeIndex: number;
  dailyChangePct: number;
  weeklyChangePct: number;
  monthlyChangePct: number;
  horizonIndices: {
    'T+1': number;
    'T+7': number;
    'T+15': number;
    'T+30': number;
    'T+45': number;
  };
  routesCount: number;
  quotesCount: number;
  weightVersion: string;
  methodologyLabel: string;
}

export class IndexEngine {
  /**
   * Calculates Jevons Geometric Mean:
   * J = exp( 1/n * sum( ln(p_i) ) )
   */
  public static calculateJevons(fares: number[]): number {
    const validFares = fares.filter(f => typeof f === 'number' && f > 0 && !isNaN(f));
    if (validFares.length === 0) return 0;
    const logSum = validFares.reduce((acc, f) => acc + Math.log(f), 0);
    return parseFloat(Math.exp(logSum / validFares.length).toFixed(2));
  }

  /**
   * Computes elementary cell Jevons geometric means for all route x horizon combinations.
   */
  public static computeElementaryCells(quotes: IFareQuoteInput[]): IElementaryCellResult[] {
    const buckets: Record<string, number[]> = {};

    for (const q of quotes) {
      const key = `${q.routeCode.toUpperCase()}__${q.advanceWindow}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(q.totalFare);
    }

    const results: IElementaryCellResult[] = [];
    for (const [key, fares] of Object.entries(buckets)) {
      const [routeCode, advanceWindow] = key.split('__');
      results.push({
        routeCode,
        advanceWindow: advanceWindow as any,
        sampleSize: fares.length,
        jevonsMeanFare: this.calculateJevons(fares),
      });
    }

    return results;
  }

  /**
   * Chains an index from previous day value using the short-Jevons factor:
   * Index_t = Index_{t-1} * (Price_t / Price_{t-1})
   */
  public static chainIndex(previousIndex: number, currentMean: number, previousMean: number): number {
    if (!previousIndex || previousIndex <= 0) previousIndex = 100.0;
    if (!currentMean || !previousMean || previousMean <= 0) return previousIndex;
    const shortJevonsFactor = currentMean / previousMean;
    return parseFloat((previousIndex * shortJevonsFactor).toFixed(2));
  }

  /**
   * Computes National APIx by aggregating Route Indices with normalized DGCA weights:
   * National_APIx = Sum( w_r * Route_APIx_r ) where Sum(w_r) = 1.000000
   */
  public static aggregateNationalIndex(
    routeIndices: Array<{ routeCode: string; indexValue: number }>,
    topN = 20
  ): number {
    const basket = DGCAService.getTopRoutes(topN);
    const weightMap = new Map(basket.map(b => [b.routeCode, b.weightInBasket]));

    let weightedSum = 0;
    let totalWeightUsed = 0;

    for (const r of routeIndices) {
      const weight = weightMap.get(r.routeCode.toUpperCase()) || 0;
      if (weight > 0 && r.indexValue > 0) {
        weightedSum += weight * r.indexValue;
        totalWeightUsed += weight;
      }
    }

    if (totalWeightUsed === 0) return 100.0;
    // Normalize in case some routes had missing observations
    return parseFloat((weightedSum / totalWeightUsed).toFixed(2));
  }
}
