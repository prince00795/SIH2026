import { DGCAService } from './dgcaService.js';
import { ProvenanceService } from './provenanceService.js';

export interface IDemoQuote {
  quoteId: string;
  sourceType: 'AIRLINE' | 'OTA';
  sourceName: string;
  mode: 'DEMO';
  routeCode: string;
  origin: string;
  destination: string;
  collectionTimestamp: string;
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
  status: 'RAW_INGESTED';
}

export class DemoDataService {
  private static cachedDemoQuotes: IDemoQuote[] | null = null;

  public static generate30DayDemoQuotes(): IDemoQuote[] {
    if (this.cachedDemoQuotes) return this.cachedDemoQuotes;

    const top20 = DGCAService.getTopRoutes(20);
    const horizons = [
      { id: 'T+1' as const, days: 1, mult: 2.25 },
      { id: 'T+7' as const, days: 7, mult: 1.55 },
      { id: 'T+15' as const, days: 15, mult: 1.18 },
      { id: 'T+30' as const, days: 30, mult: 1.00 },
      { id: 'T+45' as const, days: 45, mult: 0.90 },
    ];

    const carriers = [
      { code: '6E', name: 'IndiGo', type: 'AIRLINE' as const, source: 'IndiGo', fee: 0, mult: 1.0 },
      { code: 'AI', name: 'Air India', type: 'AIRLINE' as const, source: 'Air India', fee: 0, mult: 1.14 },
      { code: 'IX', name: 'Air India Express', type: 'AIRLINE' as const, source: 'Air India Express', fee: 0, mult: 0.96 },
      { code: 'QP', name: 'Akasa Air', type: 'AIRLINE' as const, source: 'Akasa Air', fee: 0, mult: 0.94 },
      { code: 'SG', name: 'SpiceJet', type: 'AIRLINE' as const, source: 'SpiceJet', fee: 0, mult: 0.93 },
      { code: '6E', name: 'IndiGo', type: 'OTA' as const, source: 'MakeMyTrip', fee: 350, mult: 1.01 },
      { code: 'AI', name: 'Air India', type: 'OTA' as const, source: 'EaseMyTrip', fee: 0, mult: 1.13 },
      { code: '6E', name: 'IndiGo', type: 'OTA' as const, source: 'Cleartrip', fee: 300, mult: 1.0 },
    ];

    const quotes: IDemoQuote[] = [];
    const baseDate = new Date('2026-08-20T10:00:00Z');

    // Generate quotes across 30 consecutive days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const collectionDate = new Date(baseDate.getTime() + dayOffset * 86400000);
      const collectionStr = collectionDate.toISOString();
      const collDateStr = collectionStr.split('T')[0];

      // Slight macro daily drift
      const macroTrend = 1.0 + (dayOffset * 0.0015) + (Math.sin(dayOffset / 4.0) * 0.015);

      for (const route of top20) {
        // Base distance benchmark fare: ₹3,500 base + ₹1.5/km
        const routeBase = Math.round(3200 + (route.totalTwoWayTraffic > 3000000 ? 1200 : 800));

        for (const h of horizons) {
          const departure = new Date(collectionDate.getTime() + h.days * 86400000);
          const depDateStr = departure.toISOString().split('T')[0];

          // 2 to 4 quotes per horizon cell
          const selectedCarriers = carriers.slice(0, 4);
          for (let cIdx = 0; cIdx < selectedCarriers.length; cIdx++) {
            const c = selectedCarriers[cIdx];
            // Day of week multiplier (Fri/Sun surge)
            const dow = departure.getDay();
            const dowMult = (dow === 5 || dow === 0) ? 1.12 : (dow === 2 || dow === 3) ? 0.94 : 1.0;

            const fare = Math.round(routeBase * h.mult * c.mult * dowMult * macroTrend + c.fee);
            const quoteId = `DEMO-${route.routeCode}-${h.id}-D${dayOffset}-C${cIdx}`;

            const q: IDemoQuote = {
              quoteId,
              sourceType: c.type,
              sourceName: c.source,
              mode: 'DEMO',
              routeCode: route.routeCode,
              origin: route.originIATA,
              destination: route.destinationIATA,
              collectionTimestamp: collectionStr,
              departureDate: depDateStr,
              advanceWindow: h.id,
              advanceDays: h.days,
              carrierCode: c.code,
              carrierName: c.name,
              flightNumber: `${c.code}-${200 + cIdx * 150}`,
              departureTime: cIdx % 2 === 0 ? '06:15' : '17:45',
              arrivalTime: cIdx % 2 === 0 ? '08:30' : '20:00',
              isDirect: c.type === 'AIRLINE',
              fareClass: 'Economy',
              baseFare: Math.round(fare * 0.65),
              fuelSurcharge: Math.round(fare * 0.25),
              taxes: Math.round(fare * 0.05),
              udf: 420,
              convenienceFee: c.fee,
              totalFare: fare,
              currency: 'INR',
              sha256Signature: '',
              parserVersion: '2.0.0-DEMO',
              status: 'RAW_INGESTED',
            };

            q.sha256Signature = ProvenanceService.generateFingerprint({
              sourceName: q.sourceName,
              routeCode: q.routeCode,
              flightNumber: q.flightNumber,
              departureDate: q.departureDate,
              totalFare: q.totalFare,
              collectionTimestamp: q.collectionTimestamp,
            });

            quotes.push(q);
          }
        }
      }
    }

    this.cachedDemoQuotes = quotes;
    return quotes;
  }
}
