import { RateLimiter } from './RateLimiter.js';
import { RobotsChecker } from './RobotsChecker.js';
import { ProvenanceService } from '../../services/provenanceService.js';
import { Normalizer } from './Normalizer.js';

export interface ISearchParams {
  origin: string;              // "DEL"
  destination: string;         // "BOM"
  departureDate: string;       // "YYYY-MM-DD"
  advanceWindow: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';
  advanceDays: number;
}

export interface IRawQuoteExtracted {
  quoteId: string;
  sourceType: 'AIRLINE' | 'OTA';
  sourceName: string;
  mode: 'LIVE' | 'DEMO';
  routeCode: string;
  origin: string;
  destination: string;
  collectionTimestamp: Date;
  departureDate: string;
  advanceWindow: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';
  advanceDays: number;
  carrierCode: string;
  carrierName: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  isDirect: boolean;
  fareClass: string;
  baseFare: number | null;
  fuelSurcharge: number | null;
  taxes: number | null;
  udf: number | null;
  convenienceFee: number | null;
  totalFare: number;
  currency: string;
  sha256Signature: string;
  parserVersion: string;
  status: 'RAW_INGESTED' | 'PARSER_WARNING' | 'INVALID';
}

export abstract class ScraperBase {
  public abstract sourceName: string;
  public abstract sourceType: 'AIRLINE' | 'OTA';
  public abstract portalUrl: string;
  public parserVersion = '2.0.0';

  protected rateLimiter = new RateLimiter();

  public abstract searchFlights(params: ISearchParams): Promise<IRawQuoteExtracted[]>;

  protected formatQuote(partial: Omit<IRawQuoteExtracted, 'quoteId' | 'sha256Signature' | 'parserVersion' | 'collectionTimestamp'>): IRawQuoteExtracted {
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
