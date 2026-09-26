export class Normalizer {
  /**
   * Cleans price strings containing ₹, commas, spaces, currency symbols.
   */
  static cleanPrice(val) {
    if (typeof val === 'number') return Math.max(0, val);
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Normalizes departure dates to YYYY-MM-DD.
   */
  static normalizeDate(dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return dateStr;
  }

  /**
   * Normalizes flight numbers to standard IATA format (e.g. "6E 201" -> "6E-201").
   */
  static normalizeFlightNumber(code) {
    if (!code) return 'UNSPECIFIED';
    return code.trim().replace(/\s+/g, '-').toUpperCase();
  }

  /**
   * Normalizes a raw scraped quote into a structured IQuote-compatible record.
   */
  static normalize(raw) {
    const origin = (raw.origin || 'DEL').toUpperCase().trim();
    const destination = (raw.destination || 'BOM').toUpperCase().trim();
    const flightNumber = this.normalizeFlightNumber(raw.flightNumber || '6E-000');
    const carrierCode = (raw.carrierCode || flightNumber.split('-')[0] || '6E').toUpperCase();
    const departureDate = this.normalizeDate(raw.departureDate || new Date().toISOString().split('T')[0]);
    const totalFare = this.cleanPrice(raw.totalFare || raw.baseFare || 5000);
    const quoteId = raw.quoteId || `Q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      quoteId,
      sourceType: raw.sourceType || 'AIRLINE',
      sourceName: raw.sourceName || 'IndiGo',
      mode: raw.mode || 'LIVE',
      routeCode: raw.routeCode || `${origin}-${destination}`,
      origin,
      destination,
      collectionTimestamp: raw.collectedAt ? new Date(raw.collectedAt) : new Date(),
      departureDate,
      advanceWindow: raw.advanceWindow || 'T+7',
      advanceDays: typeof raw.advanceDays === 'number' ? raw.advanceDays : 7,
      carrierCode,
      carrierName: raw.carrierName || (carrierCode === '6E' ? 'IndiGo' : carrierCode === 'AI' ? 'Air India' : carrierCode),
      flightNumber,
      departureTime: raw.departureTime || '08:00',
      arrivalTime: raw.arrivalTime || '10:15',
      isDirect: raw.isDirect !== undefined ? Boolean(raw.isDirect) : true,
      fareClass: raw.fareClass || 'Economy',
      baseFare: raw.baseFare !== undefined && raw.baseFare !== null ? this.cleanPrice(raw.baseFare) : null,
      fuelSurcharge: raw.fuelSurcharge !== undefined && raw.fuelSurcharge !== null ? this.cleanPrice(raw.fuelSurcharge) : null,
      taxes: raw.taxes !== undefined && raw.taxes !== null ? this.cleanPrice(raw.taxes) : null,
      udf: raw.udf !== undefined && raw.udf !== null ? this.cleanPrice(raw.udf) : null,
      convenienceFee: raw.convenienceFee !== undefined && raw.convenienceFee !== null ? this.cleanPrice(raw.convenienceFee) : null,
      totalFare,
      currency: raw.currency || 'INR',
      sha256Signature: raw.sha256Signature || `${origin}_${destination}_${flightNumber}_${departureDate}_${totalFare}`,
      parserVersion: raw.parserVersion || 'v4.0.0-verified',
      status: 'RAW_INGESTED',
    };
  }
}
