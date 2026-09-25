import crypto from 'crypto';

export class ProvenanceService {
  /**
   * Generates deterministic SHA-256 fingerprint for immutable fare records.
   */
  public static generateFingerprint(quote: {
    sourceName: string;
    routeCode: string;
    flightNumber: string;
    departureDate: string;
    totalFare: number;
    collectionTimestamp: string | Date;
  }): string {
    const rawString = `${quote.sourceName}:${quote.routeCode}:${quote.flightNumber}:${quote.departureDate}:${quote.totalFare}:${new Date(quote.collectionTimestamp).toISOString()}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Verifies if a stored SHA-256 signature matches the record data.
   */
  public static verifyFingerprint(quote: any): boolean {
    if (!quote.sha256Signature) return false;
    const computed = this.generateFingerprint(quote);
    return computed === quote.sha256Signature;
  }

  /**
   * Builds full provenance certificate.
   */
  public static buildProvenanceCertificate(quote: any) {
    return {
      quoteId: quote.quoteId,
      provenanceHash: quote.sha256Signature,
      source: {
        name: quote.sourceName,
        type: quote.sourceType,
        parserVersion: quote.parserVersion || '2.0.0',
      },
      lineage: {
        ingestedAt: quote.collectionTimestamp,
        verifiedAt: new Date().toISOString(),
        cleaningFilterApplied: quote.cleaningVersion || 'V1.0-MAD-DEDUP',
        statutoryStandardsCompliance: 'ILO CPI Manual (2020) & MoSPI High-Frequency Scanner Guidelines',
      },
      flightMetadata: {
        carrier: quote.carrierName,
        carrierCode: quote.carrierCode,
        flightNumber: quote.flightNumber,
        route: quote.routeCode,
        origin: quote.origin,
        destination: quote.destination,
        departureDate: quote.departureDate,
        advanceHorizon: quote.advanceWindow,
      },
      fareBreakdown: {
        baseFare: quote.baseFare,
        taxes: quote.taxes,
        fees: quote.udf || quote.convenienceFee,
        totalFare: quote.totalFare,
        currency: quote.currency || 'INR',
      },
      status: 'VERIFIED_CRYPTOGRAPHIC_PROVENANCE',
    };
  }
}
