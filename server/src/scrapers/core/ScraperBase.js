import { RateLimiter } from './RateLimiter.js';
import { RobotsChecker } from './RobotsChecker.js';
import { ProvenanceService } from '../../services/provenanceService.js';
import { Normalizer } from './Normalizer.js';

export class ScraperBase {
  sourceName = '';
  sourceType = 'AIRLINE';
  portalUrl = '';
  parserVersion = '2.0.0';

  rateLimiter = new RateLimiter();

  async searchFlights(params) {
    throw new Error('searchFlights must be implemented by subclass');
  }

  formatQuote(partial) {
    const timestamp = new Date();
    const rawQuoteId = `Q-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const quoteForHash = {
      sourceName: this.sourceName,
      routeCode: partial.routeCode,
      flightNumber: partial.flightNumber,
      departureDate: partial.departureDate,
      totalFare: partial.totalFare,
      collectionTimestamp: timestamp,
    };

    const signature = ProvenanceService.generateFingerprint(quoteForHash);

    return {
      ...partial,
      quoteId: rawQuoteId,
      collectionTimestamp: timestamp,
      sha256Signature: signature,
      parserVersion: this.parserVersion,
    };
  }
}
