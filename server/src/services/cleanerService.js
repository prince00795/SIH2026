export class CleanerService {
  /**
   * Deduplicates quotes where identical physical flights appear across both direct airline
   * and multiple OTA portals. Direct airline quote is given strict priority.
   */
  static deduplicateMultiOTA(quotes) {
    const groups = new Map();

    for (const q of quotes) {
      // Group key: flightNumber + departureDate + departureTime
      const key = `${q.flightNumber.toUpperCase().trim()}__${q.departureDate}__${(q.departureTime || '').trim()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    }

    const retained = [];
    const dropped = [];

    for (const [, list] of groups.entries()) {
      if (list.length === 1) {
        list[0].deduplicationStatus = 'ORIGINAL_KEPT';
        retained.push(list[0]);
        continue;
      }

      // Prioritize direct airline portal quote
      const directQuotes = list.filter(q => q.sourceType === 'AIRLINE' || q.isDirect);
      let best = directQuotes.length > 0 ? directQuotes[0] : list[0];

      if (directQuotes.length === 0) {
        // Pick lowest net fare
        best = list.reduce((prev, curr) => (curr.totalFare < prev.totalFare ? curr : prev), list[0]);
      }

      best.deduplicationStatus = 'ORIGINAL_KEPT';
      retained.push(best);

      for (const q of list) {
        if (q.quoteId !== best.quoteId) {
          q.deduplicationStatus = 'OTA_DUPLICATE_DROPPED';
          dropped.push(q);
        }
      }
    }

    return { retained, dropped };
  }

  /**
   * Stratified Median Absolute Deviation (MAD) modified Z-score outlier detection:
   * MAD = median(|x_i - median(x)|)
   * M_i = 0.6745 * |x_i - median(x)| / MAD
   * Flags extreme values (|M_i| > 3.0 or unrealistic fare boundaries).
   */
  static filterOutliersMAD(fares, threshold = 3.0) {
    if (fares.length === 0) return [];
    if (fares.length < 3) {
      return fares.map(f => f < 500 || f > 150000);
    }

    const sorted = [...fares].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const absDeviations = sorted.map(x => Math.abs(x - median)).sort((a, b) => a - b);
    const mad = sorted.length % 2 !== 0 ? absDeviations[mid] : (absDeviations[mid - 1] + absDeviations[mid]) / 2;

    if (mad > 1e-4) {
      return fares.map(f => {
        const modZ = (0.6745 * Math.abs(f - median)) / mad;
        return modZ > threshold || f < 500 || f > 150000;
      });
    } else {
      // Tukey's IQR fallback
      const q25 = sorted[Math.floor(sorted.length * 0.25)];
      const q75 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q75 - q25;
      if (iqr > 1e-4) {
        const lower = q25 - 1.5 * iqr;
        const upper = q75 + 1.5 * iqr;
        return fares.map(f => f < lower || f > upper || f < 500 || f > 150000);
      }
      return fares.map(f => f < 0.3 * median || f > 3.0 * median || f < 500 || f > 150000);
    }
  }

  /**
   * Cleans quotes batch: runs deduplication and outlier flagging.
   */
  static cleanQuotesBatch(rawQuotes) {
    const { retained, dropped } = this.deduplicateMultiOTA(rawQuotes);

    // Group retained quotes by route + horizon for stratified MAD
    const strata = new Map();
    for (const q of retained) {
      const key = `${q.routeCode}__${q.advanceWindow}`;
      if (!strata.has(key)) strata.set(key, []);
      strata.get(key).push(q);
    }

    const results = [];

    for (const [, list] of strata.entries()) {
      const fares = list.map(q => q.totalFare);
      const outlierFlags = this.filterOutliersMAD(fares);

      for (let i = 0; i < list.length; i++) {
        const q = list[i];
        const isOutlier = outlierFlags[i];
        const qualityFlags = ['VALID'];
        if (isOutlier) qualityFlags.push('OUTLIER_REVIEW');
        if (q.taxes === null) qualityFlags.push('MISSING_TAX');

        results.push({
          cleanedId: `CLN-${q.quoteId}`,
          rawQuoteId: q.quoteId,
          mode: q.mode || 'DEMO',
          routeCode: q.routeCode,
          advanceWindow: q.advanceWindow,
          departureDate: q.departureDate,
          carrierCode: q.carrierCode,
          flightNumber: q.flightNumber,
          totalFare: q.totalFare,
          deduplicationStatus: 'ORIGINAL_KEPT',
          qualityFlags,
        });
      }
    }

    // Add dropped duplicates with flag
    for (const d of dropped) {
      results.push({
        cleanedId: `CLN-${d.quoteId}`,
        rawQuoteId: d.quoteId,
        mode: d.mode || 'DEMO',
        routeCode: d.routeCode,
        advanceWindow: d.advanceWindow,
        departureDate: d.departureDate,
        carrierCode: d.carrierCode,
        flightNumber: d.flightNumber,
        totalFare: d.totalFare,
        deduplicationStatus: 'OTA_DUPLICATE_DROPPED',
        qualityFlags: ['DUPLICATE'],
      });
    }

    return results;
  }

  /**
   * Statistically and structurally validates an ingested flight quote.
   * Rejects quotes with invalid origins/destinations, missing dates, or fares outside realistic boundaries.
   */
  static validateQuote(quote) {
    if (!quote) return { isValid: false, reason: 'Empty quote payload' };
    if (!quote.origin || !quote.destination || quote.origin === quote.destination) {
      return { isValid: false, reason: 'Invalid origin/destination corridor' };
    }
    if (!quote.totalFare || typeof quote.totalFare !== 'number' || quote.totalFare < 500 || quote.totalFare > 250000) {
      return { isValid: false, reason: 'Total fare out of statutory bounds [500 - 250,000 INR]' };
    }
    if (!quote.departureDate) {
      return { isValid: false, reason: 'Missing departure date' };
    }
    return { isValid: true };
  }
}
