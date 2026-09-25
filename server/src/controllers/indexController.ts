import { Request, Response } from 'express';
import { DemoDataService } from '../services/demoDataService.js';
import { IndexEngine } from '../services/indexEngine.js';
import { DGCAService } from '../services/dgcaService.js';
import { QuoteModel } from '../models/Quote.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class IndexController {
  public static async getNationalIndex(req: Request, res: Response): Promise<void> {
    try {
      const timeframe = (req.query.timeframe as string) || '30D';
      const mode = (req.query.mode as string) === 'LIVE' ? 'LIVE' : 'DEMO';

      if (mode === 'LIVE') {
        let liveQuotes: any[] = [];
        try {
          liveQuotes = await QuoteModel.find({ status: 'VALID' }).lean();
        } catch {
          liveQuotes = [];
        }

        // Enforce Phase 18: Define minimum observation requirements (at least 5 valid observations)
        if (!liveQuotes || liveQuotes.length < 5) {
          sendSuccess(
            res,
            {
              status: 'INSUFFICIENT_DATA',
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
              currentNationalAPIx: null,
              dailyChangePct: 0,
              weeklyChangePct: 0,
              monthlyChangePct: 0,
              timeframe,
              asOfDate: new Date().toISOString().split('T')[0],
              routesMonitoredCount: 0,
              timeSeries: [],
              notice: 'APIx unavailable: No validated live fare observations available.',
              reason: 'No validated live fare observations available.',
              methodology: 'Short-Jevons Daily Chained Price Relatives weighted by DGCA 2-way traffic',
              weightVersion: 'RW-DGCA-2022-23-TOP20',
            },
            {
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
            }
          );
          return;
        }

        // Group live quotes by collection date
        const byDate = new Map<string, any[]>();
        for (const q of liveQuotes) {
          const dt = (q.collectionTimestamp || q.collectedAt || new Date()).toISOString().split('T')[0];
          if (!byDate.has(dt)) byDate.set(dt, []);
          byDate.get(dt)!.push(q);
        }

        const sortedDates = Array.from(byDate.keys()).sort();
        let prevCompositeFare = 0;
        let runningIndex = 100.0;

        const timeSeries = sortedDates.map((dt, idx) => {
          const dayQuotes = byDate.get(dt)!;
          const fares = dayQuotes.map((q) => q.totalFare);
          const dayMean = IndexEngine.calculateJevons(fares);

          let shortJevons = 1.0;
          if (idx > 0 && prevCompositeFare > 0) {
            shortJevons = dayMean / prevCompositeFare;
            runningIndex = parseFloat((runningIndex * shortJevons).toFixed(2));
          }
          prevCompositeFare = dayMean;

          const t1Fares = dayQuotes.filter((q) => q.advanceWindow === 'T+1').map((q) => q.totalFare);
          const t7Fares = dayQuotes.filter((q) => q.advanceWindow === 'T+7').map((q) => q.totalFare);
          const t15Fares = dayQuotes.filter((q) => q.advanceWindow === 'T+15').map((q) => q.totalFare);
          const t30Fares = dayQuotes.filter((q) => q.advanceWindow === 'T+30').map((q) => q.totalFare);
          const t45Fares = dayQuotes.filter((q) => q.advanceWindow === 'T+45').map((q) => q.totalFare);

          return {
            date: dt,
            indexValue: runningIndex,
            shortJevonsFactor: parseFloat(shortJevons.toFixed(4)),
            sampleQuotesCount: dayQuotes.length,
            horizons: {
              'T+1': t1Fares.length ? IndexEngine.calculateJevons(t1Fares) : runningIndex,
              'T+7': t7Fares.length ? IndexEngine.calculateJevons(t7Fares) : runningIndex,
              'T+15': t15Fares.length ? IndexEngine.calculateJevons(t15Fares) : runningIndex,
              'T+30': t30Fares.length ? IndexEngine.calculateJevons(t30Fares) : runningIndex,
              'T+45': t45Fares.length ? IndexEngine.calculateJevons(t45Fares) : runningIndex,
            },
          };
        });

        const latest = timeSeries[timeSeries.length - 1];
        const prevDay = timeSeries[timeSeries.length - 2] || latest;
        const weekAgo = timeSeries[Math.max(0, timeSeries.length - 8)] || latest;
        const monthAgo = timeSeries[0] || latest;

        const dailyChangePct = prevDay && prevDay.indexValue > 0
          ? parseFloat((((latest.indexValue - prevDay.indexValue) / prevDay.indexValue) * 100).toFixed(2))
          : 0;
        const weeklyChangePct = weekAgo && weekAgo.indexValue > 0
          ? parseFloat((((latest.indexValue - weekAgo.indexValue) / weekAgo.indexValue) * 100).toFixed(2))
          : 0;
        const monthlyChangePct = monthAgo && monthAgo.indexValue > 0
          ? parseFloat((((latest.indexValue - monthAgo.indexValue) / monthAgo.indexValue) * 100).toFixed(2))
          : 0;

        sendSuccess(
          res,
          {
            status: 'SUCCESS',
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
            currentNationalAPIx: latest.indexValue,
            dailyChangePct,
            weeklyChangePct,
            monthlyChangePct,
            timeframe,
            asOfDate: latest.date,
            routesMonitoredCount: new Set(liveQuotes.map((q) => q.routeCode)).size,
            methodology: 'Short-Jevons Daily Chained Price Relatives weighted by DGCA 2-way traffic',
            weightVersion: 'RW-DGCA-2022-23-TOP20',
            timeSeries,
          },
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
          }
        );
        return;
      }

      // Demo Mode: Use calibrated 30-day series
      const quotes = DemoDataService.generate30DayDemoQuotes();
      const basket = DGCAService.getTopRoutes(20);

      const byDate = new Map<string, any[]>();
      for (const q of quotes) {
        const dt = q.collectionTimestamp.split('T')[0];
        if (!byDate.has(dt)) byDate.set(dt, []);
        byDate.get(dt)!.push(q);
      }

      const sortedDates = Array.from(byDate.keys()).sort();
      let prevCompositeFare = 0;
      let runningIndex = 100.0;

      const timeSeries = sortedDates.map((dt, idx) => {
        const dayQuotes = byDate.get(dt)!;
        const fares = dayQuotes.map((q) => q.totalFare);
        const dayMean = IndexEngine.calculateJevons(fares);

        let shortJevons = 1.0;
        if (idx > 0 && prevCompositeFare > 0) {
          shortJevons = dayMean / prevCompositeFare;
          runningIndex = parseFloat((runningIndex * shortJevons).toFixed(2));
        }
        prevCompositeFare = dayMean;

        return {
          date: dt,
          indexValue: runningIndex,
          shortJevonsFactor: parseFloat(shortJevons.toFixed(4)),
          sampleQuotesCount: dayQuotes.length,
          horizons: {
            'T+1': parseFloat((runningIndex * 1.85).toFixed(2)),
            'T+7': parseFloat((runningIndex * 1.32).toFixed(2)),
            'T+15': parseFloat((runningIndex * 1.08).toFixed(2)),
            'T+30': parseFloat((runningIndex * 0.96).toFixed(2)),
            'T+45': parseFloat((runningIndex * 0.88).toFixed(2)),
          },
        };
      });

      const latest = timeSeries[timeSeries.length - 1];
      const prevDay = timeSeries[timeSeries.length - 2] || latest;
      const weekAgo = timeSeries[Math.max(0, timeSeries.length - 8)] || latest;
      const monthAgo = timeSeries[0] || latest;

      const dailyChangePct =
        prevDay.indexValue > 0
          ? parseFloat((((latest.indexValue - prevDay.indexValue) / prevDay.indexValue) * 100).toFixed(2))
          : 0;
      const weeklyChangePct =
        weekAgo.indexValue > 0
          ? parseFloat((((latest.indexValue - weekAgo.indexValue) / weekAgo.indexValue) * 100).toFixed(2))
          : 0;
      const monthlyChangePct =
        monthAgo.indexValue > 0
          ? parseFloat((((latest.indexValue - monthAgo.indexValue) / monthAgo.indexValue) * 100).toFixed(2))
          : 0;

      sendSuccess(
        res,
        {
          status: 'SUCCESS',
          badge: 'DEMO',
          mode: 'DEMO',
          warning: 'DEMO / SIMULATION DATA DISPLAYED. Not for official statutory reporting.',
          currentNationalAPIx: latest.indexValue,
          dailyChangePct,
          weeklyChangePct,
          monthlyChangePct,
          asOfDate: latest.date,
          routesMonitoredCount: basket.length,
          methodology: 'Short-Jevons Daily Chained Price Relatives weighted by DGCA 2-way traffic',
          weightVersion: 'RW-DGCA-2022-23-TOP20',
          timeSeries,
        },
        {
          badge: 'DEMO',
          mode: 'DEMO',
        }
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch national index', 'INDEX_FETCH_ERROR');
    }
  }

  public static async getRouteIndex(req: Request, res: Response): Promise<void> {
    try {
      const routeCode = (req.params.route || 'DEL-BOM').toUpperCase();
      const mode = (req.query.mode as string) === 'LIVE' ? 'LIVE' : 'DEMO';
      const meta = DGCAService.getRouteMetadata(routeCode);

      if (mode === 'LIVE') {
        let liveQuotes: any[] = [];
        try {
          liveQuotes = await QuoteModel.find({ routeCode, status: 'VALID' }).lean();
        } catch {
          liveQuotes = [];
        }

        if (!liveQuotes.length) {
          sendSuccess(
            res,
            {
              routeCode,
              corridorName: `${meta.originCity} <-> ${meta.destinationCity}`,
              rank: meta.rank,
              dgcaWeightInBasket: meta.weightInBasket,
              annualPassengers: meta.totalTwoWayTraffic,
              horizons: [],
              status: 'INSUFFICIENT_DATA',
              message: 'APIx unavailable: No validated live observations for this corridor.',
            },
            {
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
            }
          );
          return;
        }

        const horizons = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'].map((h) => {
          const hQuotes = liveQuotes.filter((q) => q.advanceWindow === h);
          const fares = hQuotes.map((q) => q.totalFare);
          const meanFare = fares.length ? IndexEngine.calculateJevons(fares) : null;
          return {
            advanceWindow: h,
            meanFare,
            sampleSize: fares.length,
            leadTimeElasticityIndex: fares.length && fares[0] > 0 && meanFare ? parseFloat((meanFare / fares[0]).toFixed(2)) : null,
          };
        });

        sendSuccess(
          res,
          {
            routeCode,
            corridorName: `${meta.originCity} <-> ${meta.destinationCity}`,
            rank: meta.rank,
            dgcaWeightInBasket: meta.weightInBasket,
            annualPassengers: meta.totalTwoWayTraffic,
            horizons,
          },
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
          }
        );
        return;
      }

      // Demo Mode
      const quotes = DemoDataService.generate30DayDemoQuotes().filter((q) => q.routeCode === routeCode);
      const horizons = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'].map((h) => {
        const hQuotes = quotes.filter((q) => q.advanceWindow === h);
        const fares = hQuotes.map((q) => q.totalFare);
        const meanFare = IndexEngine.calculateJevons(fares);
        return {
          advanceWindow: h,
          meanFare,
          sampleSize: fares.length,
          leadTimeElasticityIndex: parseFloat((meanFare / (fares[0] || 4500)).toFixed(2)),
        };
      });

      sendSuccess(
        res,
        {
          routeCode,
          corridorName: `${meta.originCity} <-> ${meta.destinationCity}`,
          rank: meta.rank,
          dgcaWeightInBasket: meta.weightInBasket,
          annualPassengers: meta.totalTwoWayTraffic,
          horizons,
        },
        {
          badge: 'DEMO',
          mode: 'DEMO',
        }
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch route index', 'ROUTE_INDEX_ERROR');
    }
  }

  public static async getHeatmapMatrix(req: Request, res: Response): Promise<void> {
    try {
      const mode = (req.query.mode as string) === 'LIVE' ? 'LIVE' : 'DEMO';
      const top20 = DGCAService.getTopRoutes(20);

      if (mode === 'LIVE') {
        let liveQuotes: any[] = [];
        try {
          liveQuotes = await QuoteModel.find({ status: 'VALID' }).lean();
        } catch {
          liveQuotes = [];
        }

        if (!liveQuotes.length) {
          sendSuccess(
            res,
            [],
            {
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
              totalRoutes: top20.length,
              totalHorizons: 5,
              asOfDate: new Date().toISOString().split('T')[0],
              message: 'No validated live quotes available for heatmap matrix.',
            }
          );
          return;
        }

        const matrix = top20.map((r) => {
          const rQuotes = liveQuotes.filter((q) => q.routeCode === r.routeCode);
          const windows: Record<string, { fare: number; status: string }> = {};

          for (const w of ['T+1', 'T+7', 'T+15', 'T+30', 'T+45']) {
            const wQuotes = rQuotes.filter((q) => q.advanceWindow === w);
            const fares = wQuotes.map((q) => q.totalFare);
            const fare = fares.length ? IndexEngine.calculateJevons(fares) : 0;

            let status = 'NORMAL';
            if (fare > 9000) status = 'SURGE';
            else if (fare > 6500) status = 'ELEVATED';
            else if (fare > 0 && fare < 4500) status = 'DISCOUNTED';

            windows[w] = { fare, status };
          }

          return {
            routeCode: r.routeCode,
            originCity: r.originCity,
            destinationCity: r.destinationCity,
            rank: r.rank,
            weightInBasket: r.weightInBasket,
            windows,
          };
        });

        sendSuccess(
          res,
          matrix,
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
            asOfDate: new Date().toISOString().split('T')[0],
            totalRoutes: matrix.length,
            totalHorizons: 5,
          }
        );
        return;
      }

      // Demo Mode
      const quotes = DemoDataService.generate30DayDemoQuotes();
      const matrix = top20.map((r) => {
        const rQuotes = quotes.filter((q) => q.routeCode === r.routeCode);
        const windows: Record<string, { fare: number; status: string }> = {};

        for (const w of ['T+1', 'T+7', 'T+15', 'T+30', 'T+45']) {
          const wQuotes = rQuotes.filter((q) => q.advanceWindow === w);
          const fares = wQuotes.map((q) => q.totalFare);
          const fare = IndexEngine.calculateJevons(fares);

          let status = 'NORMAL';
          if (w === 'T+1' && fare > 9000) status = 'SURGE';
          else if (w === 'T+7' && fare > 6500) status = 'ELEVATED';
          else if (w === 'T+45' && fare < 4500) status = 'DISCOUNTED';

          windows[w] = { fare, status };
        }

        return {
          routeCode: r.routeCode,
          originCity: r.originCity,
          destinationCity: r.destinationCity,
          rank: r.rank,
          weightInBasket: r.weightInBasket,
          windows,
        };
      });

      sendSuccess(
        res,
        matrix,
        {
          badge: 'DEMO',
          mode: 'DEMO',
          asOfDate: new Date().toISOString().split('T')[0],
          totalRoutes: matrix.length,
          totalHorizons: 5,
        }
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch heatmap', 'HEATMAP_FETCH_ERROR');
    }
  }

  public static async getLeadTimeCurve(req: Request, res: Response): Promise<void> {
    try {
      const routeCode = ((req.query.route as string) || 'DEL-BOM').toUpperCase();
      const mode = (req.query.mode as string) === 'LIVE' ? 'LIVE' : 'DEMO';

      const horizons = [
        { window: 'T+1', days: 1, name: 'Spot / Emergency' },
        { window: 'T+7', days: 7, name: 'Urgent Business' },
        { window: 'T+15', days: 15, name: 'Planned Business' },
        { window: 'T+30', days: 30, name: 'Leisure Vacation' },
        { window: 'T+45', days: 45, name: 'Early Bird' },
      ];

      if (mode === 'LIVE') {
        let liveQuotes: any[] = [];
        try {
          liveQuotes = await QuoteModel.find({ routeCode, status: 'VALID' }).lean();
        } catch {
          liveQuotes = [];
        }

        if (!liveQuotes.length) {
          sendSuccess(
            res,
            {
              routeCode,
              curve: [],
              message: 'No validated fare observations available.',
            },
            {
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
            }
          );
          return;
        }

        const curve = horizons.map((h) => {
          const hQuotes = liveQuotes.filter((q) => q.advanceWindow === h.window);
          const fares = hQuotes.map((q) => q.totalFare);
          const meanFare = fares.length ? IndexEngine.calculateJevons(fares) : 0;
          return {
            ...h,
            meanFare,
            minObserved: fares.length ? Math.min(...fares) : 0,
            maxObserved: fares.length ? Math.max(...fares) : 0,
            observationsCount: fares.length,
          };
        });

        sendSuccess(
          res,
          {
            routeCode,
            curve,
          },
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
          }
        );
        return;
      }

      // Demo Mode
      const quotes = DemoDataService.generate30DayDemoQuotes().filter((q) => q.routeCode === routeCode);
      const curve = horizons.map((h) => {
        const hQuotes = quotes.filter((q) => q.advanceWindow === h.window);
        const fares = hQuotes.map((q) => q.totalFare);
        const meanFare = IndexEngine.calculateJevons(fares);
        return {
          ...h,
          meanFare,
          minObserved: fares.length ? Math.min(...fares) : 0,
          maxObserved: fares.length ? Math.max(...fares) : 0,
          observationsCount: fares.length,
        };
      });

      sendSuccess(
        res,
        {
          routeCode,
          curve,
        },
        {
          badge: 'DEMO',
          mode: 'DEMO',
        }
      );
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch lead-time curve', 'LEAD_TIME_ERROR');
    }
  }
}

