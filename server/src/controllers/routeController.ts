import { Request, Response } from 'express';
import { DGCAService } from '../services/dgcaService.js';
import { DemoDataService } from '../services/demoDataService.js';
import { IndexEngine } from '../services/indexEngine.js';
import { QuoteModel } from '../models/Quote.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RouteController {
  public static async getRoutes(req: Request, res: Response): Promise<void> {
    try {
      const topN = parseInt(req.query.topN as string) || 20;
      const basket = DGCAService.getTopRoutes(topN);

      sendSuccess(
        res,
        basket,
        {
          badge: 'OFFICIAL_DERIVED',
          reportingAgency: 'DGCA Domestic Scheduled Passenger Traffic Basket',
          weightLabel: 'DGCA TRAFFIC-DERIVED WEIGHT',
          count: basket.length,
          topN,
        }
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch routes', 'ROUTES_FETCH_ERROR');
    }
  }

  public static async getRouteDossier(req: Request, res: Response): Promise<void> {
    try {
      const routeCode = req.params.route.toUpperCase();
      const meta = DGCAService.getRouteMetadata(routeCode);
      const mode = (req.query.mode as string) === 'LIVE' ? 'LIVE' : 'DEMO';

      if (mode === 'LIVE') {
        let liveQuotes: any[] = [];
        try {
          liveQuotes = await QuoteModel.find({ routeCode, status: 'VALID' }).lean();
        } catch {
          liveQuotes = [];
        }

        if (!liveQuotes || liveQuotes.length === 0) {
          sendSuccess(
            res,
            {
              routeCode,
              corridorName: `${meta.originCity} <-> ${meta.destinationCity}`,
              rank: meta.rank,
              annualPassengerVolume: meta.totalTwoWayTraffic,
              dgcaWeightInBasket: meta.weightInBasket,
              currentMedianFare: null,
              horizonBreakdown: [],
              carriers: [],
              carrierStatus: 'UNAVAILABLE',
              carrierNotice: 'Carrier capacity data unavailable for this route.',
              message: 'No validated fare observations available for this route.',
            },
            {
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
            }
          );
          return;
        }

        const horizonBreakdown = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'].map((h) => {
          const hQuotes = liveQuotes.filter((q) => q.advanceWindow === h);
          const fares = hQuotes.map((q) => q.totalFare);
          const mean = fares.length ? IndexEngine.calculateJevons(fares) : null;
          return {
            advanceWindow: h,
            meanFare: mean,
            sampleSize: fares.length,
          };
        });

        const validFares = liveQuotes.map((q) => q.totalFare).sort((a, b) => a - b);
        const medianFare = validFares.length
          ? validFares[Math.floor(validFares.length / 2)]
          : null;

        sendSuccess(
          res,
          {
            routeCode,
            corridorName: `${meta.originCity} <-> ${meta.destinationCity}`,
            rank: meta.rank,
            annualPassengerVolume: meta.totalTwoWayTraffic,
            dgcaWeightInBasket: meta.weightInBasket,
            currentMedianFare: medianFare,
            horizonBreakdown,
            carriers: [],
            carrierStatus: 'UNAVAILABLE',
            carrierNotice: 'Carrier capacity data unavailable for this route.',
          },
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
          }
        );
        return;
      }

      // Demo Mode: Use calibrated quotes
      const quotes = DemoDataService.generate30DayDemoQuotes().filter(
        (q) => q.routeCode === routeCode
      );

      const horizonBreakdown = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'].map((h) => {
        const hQuotes = quotes.filter((q) => q.advanceWindow === h);
        const fares = hQuotes.map((q) => q.totalFare);
        const mean = IndexEngine.calculateJevons(fares);
        return {
          advanceWindow: h,
          meanFare: mean,
          sampleSize: fares.length,
        };
      });

      const carriers = [
        {
          code: '6E',
          name: 'IndiGo',
          estimatedSharePct: 62.5,
          avgFare: Math.round((horizonBreakdown[1]?.meanFare || 5000) * 0.99),
        },
        {
          code: 'AI',
          name: 'Air India',
          estimatedSharePct: 14.5,
          avgFare: Math.round((horizonBreakdown[1]?.meanFare || 5000) * 1.14),
        },
        {
          code: 'QP',
          name: 'Akasa Air',
          estimatedSharePct: 4.7,
          avgFare: Math.round((horizonBreakdown[1]?.meanFare || 5000) * 0.94),
        },
        {
          code: 'SG',
          name: 'SpiceJet',
          estimatedSharePct: 4.2,
          avgFare: Math.round((horizonBreakdown[1]?.meanFare || 5000) * 0.93),
        },
      ];

      sendSuccess(
        res,
        {
          routeCode,
          corridorName: `${meta.originCity} <-> ${meta.destinationCity}`,
          rank: meta.rank,
          annualPassengerVolume: meta.totalTwoWayTraffic,
          dgcaWeightInBasket: meta.weightInBasket,
          currentMedianFare: horizonBreakdown[1]?.meanFare || 5400,
          horizonBreakdown,
          carriers,
        },
        {
          badge: 'DEMO',
          mode: 'DEMO',
        }
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch route dossier', 'ROUTE_DOSSIER_ERROR');
    }
  }

  public static async compareRoutes(req: Request, res: Response): Promise<void> {
    try {
      const r1Code = ((req.query.route1 as string) || 'DEL-BOM').toUpperCase();
      const r2Code = ((req.query.route2 as string) || 'DEL-BLR').toUpperCase();
      const mode = (req.query.mode as string) === 'LIVE' ? 'LIVE' : 'DEMO';

      const m1 = DGCAService.getRouteMetadata(r1Code);
      const m2 = DGCAService.getRouteMetadata(r2Code);

      if (mode === 'LIVE') {
        let q1: any[] = [];
        let q2: any[] = [];
        try {
          q1 = await QuoteModel.find({ routeCode: r1Code, status: 'VALID' }).lean();
          q2 = await QuoteModel.find({ routeCode: r2Code, status: 'VALID' }).lean();
        } catch {
          q1 = [];
          q2 = [];
        }

        if (q1.length === 0 || q2.length === 0) {
          sendSuccess(
            res,
            {
              corridor1: {
                routeCode: r1Code,
                corridorName: `${m1.originCity} <-> ${m1.destinationCity}`,
                rank: m1.rank,
                weight: m1.weightInBasket,
                twoWayTraffic: m1.totalTwoWayTraffic,
                averageFare: null,
              },
              corridor2: {
                routeCode: r2Code,
                corridorName: `${m2.originCity} <-> ${m2.destinationCity}`,
                rank: m2.rank,
                weight: m2.weightInBasket,
                twoWayTraffic: m2.totalTwoWayTraffic,
                averageFare: null,
              },
              priceSpreadPct: null,
              message: 'Comparison unavailable: Insufficient live observations for one or both corridors.',
            },
            {
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
            }
          );
          return;
        }

        const f1 = IndexEngine.calculateJevons(q1.map((q) => q.totalFare));
        const f2 = IndexEngine.calculateJevons(q2.map((q) => q.totalFare));

        sendSuccess(
          res,
          {
            corridor1: {
              routeCode: r1Code,
              corridorName: `${m1.originCity} <-> ${m1.destinationCity}`,
              rank: m1.rank,
              weight: m1.weightInBasket,
              twoWayTraffic: m1.totalTwoWayTraffic,
              averageFare: f1,
            },
            corridor2: {
              routeCode: r2Code,
              corridorName: `${m2.originCity} <-> ${m2.destinationCity}`,
              rank: m2.rank,
              weight: m2.weightInBasket,
              twoWayTraffic: m2.totalTwoWayTraffic,
              averageFare: f2,
            },
            priceSpreadPct: f2 > 0 ? parseFloat((((f1 - f2) / f2) * 100).toFixed(2)) : 0,
          },
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
          }
        );
        return;
      }

      // Demo Mode
      const quotes = DemoDataService.generate30DayDemoQuotes();
      const q1 = quotes.filter((q) => q.routeCode === r1Code);
      const q2 = quotes.filter((q) => q.routeCode === r2Code);

      const f1 = IndexEngine.calculateJevons(q1.map((q) => q.totalFare));
      const f2 = IndexEngine.calculateJevons(q2.map((q) => q.totalFare));

      sendSuccess(
        res,
        {
          corridor1: {
            routeCode: r1Code,
            corridorName: `${m1.originCity} <-> ${m1.destinationCity}`,
            rank: m1.rank,
            weight: m1.weightInBasket,
            twoWayTraffic: m1.totalTwoWayTraffic,
            averageFare: f1,
          },
          corridor2: {
            routeCode: r2Code,
            corridorName: `${m2.originCity} <-> ${m2.destinationCity}`,
            rank: m2.rank,
            weight: m2.weightInBasket,
            twoWayTraffic: m2.totalTwoWayTraffic,
            averageFare: f2,
          },
          priceSpreadPct: parseFloat((((f1 - f2) / f2) * 100).toFixed(2)),
        },
        {
          badge: 'DEMO',
          mode: 'DEMO',
        }
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to compare routes', 'ROUTE_COMPARE_ERROR');
    }
  }
}

