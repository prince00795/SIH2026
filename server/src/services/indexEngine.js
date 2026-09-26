import { DGCAService } from './dgcaService.js';

export class IndexEngine {
  /**
   * Calculates Jevons Geometric Mean:
   * J = exp( 1/n * sum( ln(p_i) ) )
   */
  static calculateJevons(fares) {
    const validFares = fares.filter(f => typeof f === 'number' && f > 0 && !isNaN(f));
    if (validFares.length === 0) return 0;
    const logSum = validFares.reduce((acc, f) => acc + Math.log(f), 0);
    return parseFloat(Math.exp(logSum / validFares.length).toFixed(2));
  }

  /**
   * Computes elementary cell Jevons geometric means for all route x horizon combinations.
   */
  static computeElementaryCells(quotes) {
    const buckets = {};

    for (const q of quotes) {
      const key = `${q.routeCode.toUpperCase()}__${q.advanceWindow}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(q.totalFare);
    }

    const results = [];
    for (const [key, fares] of Object.entries(buckets)) {
      const [routeCode, advanceWindow] = key.split('__');
      results.push({
        routeCode,
        advanceWindow,
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
  static chainIndex(previousIndex, currentMean, previousMean) {
    if (!previousIndex || previousIndex <= 0) previousIndex = 100.0;
    if (!currentMean || !previousMean || previousMean <= 0) return previousIndex;
    const shortJevonsFactor = currentMean / previousMean;
    return parseFloat((previousIndex * shortJevonsFactor).toFixed(2));
  }

  /**
   * Computes National APIx by aggregating Route Indices with normalized DGCA weights:
   * National_APIx = Sum( w_r * Route_APIx_r ) where Sum(w_r) = 1.000000
   */
  static aggregateNationalIndex(routeIndices, topN = 20) {
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
